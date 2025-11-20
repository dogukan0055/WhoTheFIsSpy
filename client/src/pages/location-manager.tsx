import React, { useState } from 'react';
import { useGame } from '@/lib/game-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Layout from '@/components/layout';
import { ArrowLeft, Plus, Trash2, MapPin, Folder, Check, X, Lock } from 'lucide-react';
import { Link } from 'wouter';
import { playSound } from '@/lib/audio';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from '@/lib/utils';
import { INITIAL_CATEGORIES } from '@/lib/locations';
import { getCategoryName, getLocationName } from '@/lib/location-i18n';
import { Switch } from '@/components/ui/switch';
import { useTranslation } from '@/hooks/use-translation';

const PREDEFINED_IDS = INITIAL_CATEGORIES.map(c => c.id);

export default function LocationManager() {
  const { state, dispatch } = useGame();
  const [newCatName, setNewCatName] = useState('');
  const [newLocName, setNewLocName] = useState('');
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [isAddingCat, setIsAddingCat] = useState(false);
  const [isAddingLoc, setIsAddingLoc] = useState(false);
  const { t, language } = useTranslation();

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    const newId = newCatName.toLowerCase().replace(/\s+/g, '-');
    dispatch({
      type: 'ADD_CATEGORY',
      payload: {
        id: newId,
        name: newCatName,
        icon: 'Folder',
        locations: []
      }
    });
    setNewCatName('');
    setIsAddingCat(false);
    playSound('success');
    toast({ title: t('locations.categoryAdded'), description: `${newCatName} ${t('locations.categoryAddedDesc')}` });
  };

  const handleAddLocation = () => {
    if (!newLocName.trim() || !selectedCatId) return;
    dispatch({
      type: 'ADD_LOCATION',
      payload: {
        categoryId: selectedCatId,
        location: newLocName
      }
    });
    setNewLocName('');
    setIsAddingLoc(false);
    playSound('success');
    toast({ title: t('locations.locationAdded'), description: `${newLocName} ${t('locations.locationAddedDesc')}` });
  };

  const handleDeleteCategory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (PREDEFINED_IDS.includes(id)) {
      toast({ title: t('locations.actionDenied'), description: t('locations.coreCategory'), variant: "destructive" });
      playSound('error');
      return;
    }

    if (state.gameData.categories.length <= 1) {
      toast({ title: t('locations.actionDenied'), description: t('locations.lastCategory'), variant: "destructive" });
      return;
    }
    dispatch({ type: 'DELETE_CATEGORY', payload: id });
    playSound('error');
  };

  const toggleCategory = (cat: { id: string, locations: string[] }, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (cat.locations.length === 0) {
      toast({ title: t('locations.categoryEmpty'), description: t('locations.categoryEmptyDesc'), variant: "destructive" });
      playSound('error');
      return;
    }

    // Prevent disabling if it's the last one
    if (state.settings.selectedCategories.includes(cat.id) && state.settings.selectedCategories.length === 1) {
      toast({ title: t('locations.warning'), description: t('locations.mustKeepOne'), variant: "destructive" });
      playSound('error');
      return;
    }

    dispatch({ type: 'TOGGLE_CATEGORY', payload: cat.id });
    playSound('click');
  };

  const handleRemoveLocation = (catId: string, loc: string, isPredefined: boolean) => {
     if (isPredefined) {
        // Wait, user said "Pre-defined locations of the game can not be deleted. Only allow user to enable and disable them."
        // To simplify "enable/disable" individual locations without massive schema changes, 
        // I will interpret this as: Predefined locations can't be removed from the list at all.
        toast({ title: t('locations.actionDenied'), description: t('locations.coreLocation'), variant: "destructive" });
        playSound('error');
        return;
     }
     dispatch({ type: 'REMOVE_LOCATION', payload: { categoryId: catId, location: loc } });
  };

  const toggleLocation = (categoryId: string, location: string) => {
    dispatch({ type: 'TOGGLE_LOCATION', payload: { categoryId, location } });
    playSound('click');
  };

  return (
    <Layout>
      <div className="flex items-center mb-6">
        <Link href="/setup">
          <Button variant="ghost" size="icon" onClick={() => playSound('click')}>
            <ArrowLeft className="w-6 h-6" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold font-mono ml-2">{t('locations.title')}</h1>
      </div>

      <div className="space-y-6 pb-24 max-w-4xl mx-auto">
        {/* Categories List */}
        <div className="grid gap-3">
           {state.gameData.categories.map(cat => {
             const isSelected = state.settings.selectedCategories.includes(cat.id);
             const isExpanded = selectedCatId === cat.id;
             const isPredefined = PREDEFINED_IDS.includes(cat.id);

             return (
               <div key={cat.id} className={cn("border rounded-xl overflow-hidden transition-all duration-300", isExpanded ? "bg-card/50 border-primary/50" : "bg-card/20 border-white/5")}>
                 <div 
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5"
                    onClick={() => {
                      setSelectedCatId(isExpanded ? null : cat.id);
                      playSound('click');
                    }}
                 >
                   <div className="flex items-center gap-3">
                      <div
                        onClick={(e) => toggleCategory(cat, e)}
                        className={cn("w-6 h-6 rounded border flex items-center justify-center transition-colors", isSelected ? "bg-primary border-primary" : "border-muted-foreground")}
                      >
                        {isSelected && <Check className="w-4 h-4 text-white" />}
                      </div>
                      <span className="font-bold font-mono text-lg">{getCategoryName(language, cat)}</span>
                      <span className="text-xs text-muted-foreground">({cat.locations.length})</span>
                   </div>
                   
                   <div className="flex items-center gap-2">
                     {isPredefined && <Lock className="w-3 h-3 text-muted-foreground/50" />}
                     {!isPredefined && (
                       <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/20" onClick={(e) => handleDeleteCategory(cat.id, e)}>
                         <Trash2 className="w-4 h-4" />
                       </Button>
                     )}
                   </div>
                 </div>

                 {/* Expanded Locations */}
                 {isExpanded && (
                   <div className="p-4 pt-0 bg-black/20 border-t border-white/5 space-y-3">
                      <p className="text-xs text-muted-foreground flex items-center gap-2">
                        <span className={cn('inline-flex h-2 w-2 rounded-full', isSelected ? 'bg-green-400' : 'bg-muted-foreground/50')} />
                        {isSelected ? t('locations.allOn') : t('locations.allOff')}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {cat.locations.map((loc, idx) => {
                          const originalCat = INITIAL_CATEGORIES.find(c => c.id === cat.id);
                          const isCoreLoc = originalCat?.locations.includes(loc);
                          const isDisabled = (state.settings.disabledLocations[cat.id] || []).includes(loc) || !isSelected;

                          return (
                            <div key={idx} className="flex items-center justify-between p-3 rounded bg-white/5 text-sm group">
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={!isDisabled}
                                  disabled={!isSelected}
                                  onCheckedChange={() => toggleLocation(cat.id, loc)}
                                  className="shrink-0"
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <span className={cn("truncate mr-2", isDisabled && "line-through text-muted-foreground/60")}>{getLocationName(language, loc)}</span>
                              </div>
                              {!isCoreLoc ? (
                                <button
                                  onClick={() => handleRemoveLocation(cat.id, loc, false)}
                                  className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              ) : (
                                <Lock className="w-3 h-3 text-muted-foreground/30" />
                              )}
                            </div>
                          );
                        })}
                        <Dialog open={isAddingLoc} onOpenChange={setIsAddingLoc}>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="border-dashed border-white/20 text-muted-foreground hover:text-primary hover:border-primary">
                              <Plus className="w-4 h-4 mr-2" /> {t('locations.addLocation')}
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>{t('locations.newLocationFor')} {getCategoryName(language, cat)}</DialogTitle>
                            </DialogHeader>
                            <div className="py-4">
                              <Input
                                placeholder="E.g. Submarine Base"
                                value={newLocName}
                                onChange={(e) => setNewLocName(e.target.value)}
                              />
                            </div>
                            <DialogFooter>
                              <Button onClick={handleAddLocation}>{t('locations.confirm')}</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                   </div>
                 )}
               </div>
             );
           })}
        </div>

        {/* Add Category Button */}
        <Dialog open={isAddingCat} onOpenChange={setIsAddingCat}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full h-12 border-dashed border-white/20 text-muted-foreground hover:text-primary hover:border-primary">
              <Plus className="w-4 h-4 mr-2" /> {t('locations.addCategory')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('locations.newCategory')}</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Input
                placeholder="E.g. Sci-Fi Movies"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button onClick={handleAddCategory}>{t('locations.create')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
