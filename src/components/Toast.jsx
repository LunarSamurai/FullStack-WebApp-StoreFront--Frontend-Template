import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, XCircle, Info } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Toast() {
  const { notification } = useCart();

  const icons = {
    success: <CheckCircle size={18} className="text-green-500" />,
    error: <XCircle size={18} className="text-red-500" />,
    info: <Info size={18} className="text-gold-500" />
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      <AnimatePresence>
        {notification && (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl shadow-card-hover border border-cream-200"
          >
            {icons[notification.type] || icons.info}
            <span className="text-sm font-medium text-coffee-800">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
