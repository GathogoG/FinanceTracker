"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, PlusCircle, Check, ChevronsUpDown } from "lucide-react";
import { useFinancials } from "@/context/financial-context";
import { searchStocks, SearchStocksOutput, getHistoricalPrice } from "@/ai/flows/investment-flows";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { DatePicker } from "./ui/date-picker";
import { format } from "date-fns";

type StockSuggestion = {
  symbol: string;
  name: string;
  quoteType: string;
};

const filterTabs = [
  { value: "ALL", label: "All" },
  { value: "EQUITY", label: "Stocks" },
  { value: "ETF", label: "ETFs" },
  { value: "INDEX", label: "Indices" },
];

export function AddInvestmentDialog() {
  const [open, setOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const { toast } = useToast();
  const { addInvestment, formatCurrency } = useFinancials();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [suggestions, setSuggestions] = useState<SearchStocksOutput>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [selectedStock, setSelectedStock] = useState<StockSuggestion | null>(null);
  const [quantity, setQuantity] = useState("");
  const [purchaseDate, setPurchaseDate] = useState<Date | undefined>(new Date());
  const [pricePerShare, setPricePerShare] = useState("");
  const [isFetchingPrice, setIsFetchingPrice] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);

  const totalCost = useMemo(() => {
    const q = parseFloat(quantity);
    const p = parseFloat(pricePerShare);
    return q > 0 && p > 0 ? q * p : 0;
  }, [quantity, pricePerShare]);

  const resetForm = useCallback(() => {
    setSearchQuery("");
    setFilterType("ALL");
    setSuggestions([]);
    setSelectedStock(null);
    setQuantity("");
    setPurchaseDate(new Date());
    setPricePerShare("");
    setIsLoading(false);
    setIsSearching(false);
    setIsFetchingPrice(false);
  }, []);

  useEffect(() => {
    const handler = setTimeout(async () => {
      if (searchQuery.length < 2) {
        setSuggestions([]);
        return;
      }
      setIsSearching(true);
      const results = await searchStocks({ query: searchQuery });
      setSuggestions(results);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    if (!selectedStock || !purchaseDate) return;

    const fetchPrice = async () => {
      setIsFetchingPrice(true);
      setPricePerShare("");
      try {
        const result = await getHistoricalPrice({
          symbol: selectedStock.symbol,
          date: purchaseDate.toISOString(),
        });
        if (result.price !== undefined) {
          setPricePerShare(String(result.price));
        } else {
          toast({
            title: "Price not found",
            description: `Could not fetch the price for ${selectedStock.symbol} on ${format(purchaseDate, "PPP")}. Please enter it manually.`,
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Error fetching historical price", error);
        toast({ title: "Error", description: "Could not fetch historical price.", variant: "destructive" });
      } finally {
        setIsFetchingPrice(false);
      }
    };

    fetchPrice();
  }, [selectedStock, purchaseDate, toast]);
  

  const filteredSuggestions = useMemo(() => {
    if (filterType === "ALL") return suggestions;
    return suggestions.filter(s => s.quoteType === filterType);
  }, [suggestions, filterType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStock || !quantity || !pricePerShare || !purchaseDate) {
      toast({ title: "Error", description: "Please fill in all fields.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      await addInvestment({
        symbol: selectedStock.symbol,
        name: selectedStock.name,
        quantity: parseFloat(quantity),
        purchaseValue: totalCost,
        purchaseDate: purchaseDate.toISOString(),
      });

      toast({
        title: "Investment Added",
        description: `Your investment in ${selectedStock.name} has been added.`,
      });
      resetForm();
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to add investment.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetForm();
      setOpen(isOpen);
    }}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-9 gap-1">
          <PlusCircle className="h-4 w-4" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Add Investment
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Investment</DialogTitle>
            <DialogDescription>
              Add a new holding to your portfolio.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="stock">Security</Label>
              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={popoverOpen}
                    className="w-full justify-between font-normal"
                  >
                    {selectedStock ? `${selectedStock.name} (${selectedStock.symbol})` : "Select security..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command shouldFilter={false}>
                    <CommandInput
                      placeholder="Search..."
                      value={searchQuery}
                      onValueChange={setSearchQuery}
                    />
                     <Tabs value={filterType} onValueChange={setFilterType} className="w-full p-1">
                        <TabsList className="grid w-full grid-cols-4 h-8">
                           {filterTabs.map(tab => (
                             <TabsTrigger key={tab.value} value={tab.value} className="text-xs h-6">
                               {tab.label}
                             </TabsTrigger>
                           ))}
                        </TabsList>
                    </Tabs>
                    <CommandList>
                      {isSearching && <div className="p-4 text-sm text-center">Searching...</div>}
                      {!isSearching && filteredSuggestions.length === 0 && <CommandEmpty>No security found.</CommandEmpty>}
                      <CommandGroup>
                        {filteredSuggestions.map((stock) => (
                          <CommandItem
                            key={stock.symbol}
                            value={`${stock.name} (${stock.symbol})`}
                            onSelect={() => {
                              setSelectedStock(stock);
                              setPopoverOpen(false);
                            }}
                          >
                            <Check className={cn("mr-2 h-4 w-4", selectedStock?.symbol === stock.symbol ? "opacity-100" : "opacity-0")}/>
                            <div>
                              <p className="font-medium">{stock.symbol}</p>
                              <p className="text-xs text-muted-foreground">{stock.name}</p>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input id="quantity" type="number" placeholder="e.g., 10" value={quantity} onChange={(e) => setQuantity(e.target.value)} disabled={!selectedStock} />
               </div>
                <div className="space-y-2">
                  <Label htmlFor="purchaseDate">Purchase Date</Label>
                  <DatePicker date={purchaseDate} setDate={setPurchaseDate} />
               </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="pricePerShare">Price per Share</Label>
                <div className="relative">
                    <Input id="pricePerShare" type="number" placeholder="e.g., 150.25" value={pricePerShare} onChange={e => setPricePerShare(e.target.value)} disabled={isFetchingPrice || !purchaseDate} />
                    {isFetchingPrice && <Loader2 className="absolute right-2 top-2 h-4 w-4 animate-spin" />}
                </div>
            </div>

            {totalCost > 0 && (
                <div className="mt-2 text-sm text-muted-foreground">
                    Total Cost: {formatCurrency(totalCost)}
                </div>
            )}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isLoading || isFetchingPrice}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Adding..." : "Add Investment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
