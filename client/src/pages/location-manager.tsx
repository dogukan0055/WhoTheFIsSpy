import React, { useState } from 'react';
import { useGame } from '@/lib/game-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Layout from '@/components/layout';
import { ArrowLeft, Plus, Trash2, MapPin, Folder, Check, X } from 'lucide-react';
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

export default function LocationManager() {
  const { state, dispatch } = useGame();
  const [newCatName, setNewCatName] = useState('');
  const [newLocName, setNewLocName] = useState('');
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [isAddingCat, setIsAddingCat] = useState(false);
  const [isAddingLoc, setIsAddingLoc] = useState(false);

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
    toast({ title: "Category Added", description: `${newCatName} added to database.` });
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
    toast({ title: "Location Added", description: `${newLocName} added to category.` });
  };

  const handleDeleteCategory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (state.gameData.categories.length <= 1) {
      toast({ title: "Action Denied", description: "Cannot delete the last category.", variant: "destructive" });
      return;
    }
    dispatch({ type: 'DELETE_CATEGORY', payload: id });
    playSound('error');
  };

  const toggleCategory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({ type: 'TOGGLE_CATEGORY', payload: id });
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
        <h1 className="text-2xl font-bold font-mono ml-2">DATABASE</h1>
      </div>

      <div className="space-y-6 pb-24">
        {/* Categories List */}
        <div className="grid gap-3">
           {state.gameData.categories.map(cat => {
             const isSelected = state.settings.selectedCategories.includes(cat.id);
             const isExpanded = selectedCatId === cat.id;

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
                        onClick={(e) => toggleCategory(cat.id, e)}
                        className={cn("w-6 h-6 rounded border flex items-center justify-center transition-colors", isSelected ? "bg-primary border-primary" : "border-muted-foreground")}
                      >
                        {isSelected && <Check className="w-4 h-4 text-white" />}
                      </div>
                      <span className="font-bold font-mono text-lg">{cat.name}</span>
                      <span className="text-xs text-muted-foreground">({cat.locations.length})</span>
                   </div>
                   
                   {cat.id !== 'standard' && (
                     <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/20" onClick={(e) => handleDeleteCategory(cat.id, e)}>
                       <Trash2 className="w-4 h-4" />
                     </Button>
                   )}
                 </div>

                 {/* Expanded Locations */}
                 {isExpanded && (
                   <div className="p-4 pt-0 bg-black/20 border-t border-white/5">
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        {cat.locations.map((loc, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 rounded bg-white/5 text-sm">
                            <span className="truncate mr-2">{loc}</span>
                            <button 
                              onClick={() => dispatch({ type: 'REMOVE_LOCATION', payload: { categoryId: cat.id, location: loc } })}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        <Dialog open={isAddingLoc} onOpenChange={setIsAddingLoc}>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="border-dashed border-white/20 text-muted-foreground hover:text-primary hover:border-primary">
                              <Plus className="w-4 h-4 mr-2" /> Add Location
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>New Location for {cat.name}</DialogTitle>
                            </DialogHeader>
                            <div className="py-4">
                              <Input 
                                placeholder="E.g. Submarine Base" 
                                value={newLocName}
                                onChange={(e) => setNewLocName(e.target.value)}
                              />
                            </div>
                            <DialogFooter>
                              <Button onClick={handleAddLocation}>Confirm</Button>
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
              <Plus className="w-4 h-4 mr-2" /> CREATE NEW CATEGORY
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Category</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Input 
                placeholder="E.g. Sci-Fi Movies" 
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button onClick={handleAddCategory}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
