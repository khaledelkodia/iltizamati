import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCommitmentStore } from '../../store/useCommitmentStore';
import CommitmentCard from './CommitmentCard';
import { Search, Filter, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CommitmentsListScreen() {
  const { commitments, payments } = useCommitmentStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const navigate = useNavigate();

  const filteredCommitments = commitments.filter(c => {
     // Search filter
     if (searchQuery && !c.name.includes(searchQuery) && !c.category_name_ar.includes(searchQuery)) return false;
     
     // Status filter
     const payment = payments.find(p => p.commitment_id === c.id);
     const isPaid = payment?.status === 'paid';
     
     if (filter === 'paid' && !isPaid) return false;
     if (filter === 'unpaid' && isPaid) return false;
     
     return true;
  });

  return (
    <div className="p-4 safe-area-top min-h-screen flex flex-col">
       
      {/* Header */}
      <div className="flex justify-between items-center mt-4 mb-6">
        <h1 className="text-2xl font-bold text-text-primary">الالتزامات</h1>
        <button 
           onClick={() => navigate('/commitments/add')}
           className="w-10 h-10 rounded-full bg-accent-primary text-white flex items-center justify-center shadow-glow-green"
        >
           <Plus size={24} />
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex space-x-2 space-x-reverse mb-6">
         <div className="relative flex-1">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-text-muted">
               <Search size={18} />
            </div>
            <input 
               type="text"
               placeholder="ابحث عن التزام..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full bg-bg-secondary border border-border-primary rounded-xl py-3 pr-10 pl-4 text-sm text-text-primary focus:border-accent-primary transition-colors"
            />
         </div>
         <button className="w-12 h-[46px] rounded-xl bg-bg-secondary border border-border-primary flex items-center justify-center text-text-muted hover:text-accent-primary transition-colors">
            <Filter size={18} />
         </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-bg-secondary p-1 rounded-xl mb-6">
         {['all', 'unpaid', 'paid'].map((tab) => (
            <button
               key={tab}
               onClick={() => setFilter(tab as any)}
               className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors relative z-10 ${filter === tab ? 'text-white' : 'text-text-muted'}`}
            >
               {filter === tab && (
                  <motion.div
                     layoutId="tab-indicator"
                     className="absolute inset-0 bg-bg-tertiary border border-border-primary rounded-lg -z-10"
                     transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
               )}
               {tab === 'all' ? 'الكل' : tab === 'unpaid' ? 'غير مدفوع' : 'مدفوع'}
            </button>
         ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto pb-6 -mx-4 px-4 space-y-4">
         <AnimatePresence mode="popLayout">
            {filteredCommitments.length > 0 ? (
               filteredCommitments.map(commitment => {
                  const payment = payments.find(p => p.commitment_id === commitment.id);
                  const isPaid = payment?.status === 'paid';
                  
                  return (
                     <CommitmentCard 
                        key={commitment.id} 
                        commitment={commitment} 
                        isPaid={isPaid}
                     />
                  );
               })
            ) : (
               <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                  className="text-center py-20 text-text-muted"
               >
                  لا توجد التزامات مطابقة للبحث
               </motion.div>
            )}
         </AnimatePresence>
      </div>
    </div>
  );
}
