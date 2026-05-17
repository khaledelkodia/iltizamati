import { useState, useEffect } from 'react';
import { useCommitmentStore } from '../../store/useCommitmentStore';
import { paymentRepo } from '../../database/repositories/paymentRepo';

export interface CategoryBreakdown {
  category_id: number;
  category_name: string;
  color: string;
  amount: number;
  percentage: number;
}

export function useReportsData() {
  const { commitments, categories } = useCommitmentStore();
  
  const [totalOutstandingDebt, setTotalOutstandingDebt] = useState<number>(0);
  const [monthlyBurden, setMonthlyBurden] = useState<number>(0);
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdown[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const calculateData = async () => {
      setIsLoading(true);
      
      // 1. Calculate Monthly Burden (Sum of monthly amounts of active commitments)
      const burden = commitments
        .filter(c => c.is_active)
        .reduce((sum, c) => sum + c.amount, 0);
      
      // 2. Calculate Category Breakdown based on monthly burden
      const breakdownMap = new Map<number, CategoryBreakdown>();
      
      commitments.filter(c => c.is_active).forEach(c => {
         const cat = categories.find(cat => cat.id === c.category_id);
         if (!cat) return;
         
         if (!breakdownMap.has(cat.id)) {
            breakdownMap.set(cat.id, {
               category_id: cat.id,
               category_name: cat.name_ar,
               color: cat.color,
               amount: 0,
               percentage: 0
            });
         }
         
         const existing = breakdownMap.get(cat.id)!;
         existing.amount += c.amount;
      });

      const breakdownArray = Array.from(breakdownMap.values()).map(item => ({
         ...item,
         percentage: burden > 0 ? Math.round((item.amount / burden) * 100) : 0
      })).sort((a, b) => b.amount - a.amount); // Sort by highest amount

      // 3. Calculate Total Outstanding Debt (For installments only)
      let debt = 0;
      for (const c of commitments) {
         if (c.commitment_type === 'installment' && c.total_amount && c.is_active) {
            const totalPaid = await paymentRepo.getTotalPaidForCommitment(c.id);
            const remaining = c.total_amount - totalPaid;
            if (remaining > 0) {
               debt += remaining;
            }
         }
      }

      if (isMounted) {
         setMonthlyBurden(burden);
         setCategoryBreakdown(breakdownArray);
         setTotalOutstandingDebt(debt);
         setIsLoading(false);
      }
    };

    if (commitments.length > 0 && categories.length > 0) {
      calculateData();
    } else {
      setIsLoading(false);
    }

    return () => { isMounted = false; };
  }, [commitments, categories]);

  return {
    totalOutstandingDebt,
    monthlyBurden,
    categoryBreakdown,
    isLoading
  };
}
