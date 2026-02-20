import { X, Printer, Download, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { GlassBox } from '@/components/ui/Card';
import { motion, AnimatePresence } from 'framer-motion';

interface ReceiptModalProps {
    isOpen: boolean;
    onClose: () => void;
    payment: {
        receipt_number: string;
        amount: number;
        payment_method: string;
        created_at: string;
        user: { first_name: string, surname: string };
        program?: { name: string };
    };
    organization: any;
}

export function ReceiptModal({ isOpen, onClose, payment, organization }: ReceiptModalProps) {
    if (!isOpen) return null;

    const handlePrint = () => {
        window.print();
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-md"
                />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-sm overflow-hidden"
                >
                    <GlassBox className="p-0 border-white/10 shadow-2xl overflow-hidden bg-slate-900">
                        {/* Receipt Header */}
                        <div className="bg-gradient-premium p-8 text-center text-white relative">
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors print:hidden"
                            >
                                <X className="w-4 h-4" />
                            </button>
                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md border border-white/30">
                                <CheckCircle2 className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-black uppercase tracking-tight">Payment Confirmed</h3>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mt-1">Official Digital Receipt</p>
                        </div>

                        {/* Receipt Body */}
                        <div className="p-8 space-y-8 bg-white text-slate-900 print:text-black">
                            <div className="text-center space-y-1">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Organization</div>
                                <div className="text-lg font-black uppercase tracking-tight">{organization?.name}</div>
                            </div>

                            <div className="space-y-4 py-6 border-y border-slate-100 border-dashed">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Receipt #</span>
                                    <span className="text-xs font-mono font-bold">{payment.receipt_number}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</span>
                                    <span className="text-xs font-bold">{new Date(payment.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payer</span>
                                    <span className="text-xs font-bold">{payment.user.first_name} {payment.user.surname}</span>
                                </div>
                                <div className="flex justify-between items-center text-indigo-600">
                                    <span className="text-[10px] font-black uppercase tracking-widest">Total Paid</span>
                                    <span className="text-lg font-black">${payment.amount.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Method</span>
                                    <span className="text-xs font-bold uppercase">{payment.payment_method}</span>
                                </div>
                                <div className="flex justify-between items-start">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</span>
                                    <span className="text-xs font-bold text-right max-w-[150px]">
                                        Enrollment Fee: {payment.program?.name || 'Program Subscription'}
                                    </span>
                                </div>
                            </div>

                            <div className="pt-8 text-center">
                                <div className="text-[8px] font-black text-slate-300 uppercase tracking-[0.3em] mb-4">Verification QR Code</div>
                                <div className="w-24 h-24 bg-slate-50 border border-slate-100 rounded-xl mx-auto flex items-center justify-center opacity-30">
                                    {/* Placeholder for QR - we could use QRCodeSVG if needed */}
                                    <div className="text-[6px] font-black uppercase">Secure Token</div>
                                </div>
                                <p className="text-[10px] font-bold text-slate-400 mt-6 leading-relaxed">
                                    Thank you for your contribution.<br />
                                    Keep this receipt for your records.
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="p-6 bg-slate-800 flex gap-3 print:hidden">
                            <Button
                                variant="outline"
                                className="flex-1 h-12 bg-white/5 border-white/10 text-[10px] font-black uppercase tracking-widest"
                                onClick={handlePrint}
                            >
                                <Printer className="w-4 h-4 mr-2" /> Print
                            </Button>
                            <Button
                                variant="premium"
                                className="flex-1 h-12 text-[10px] font-black uppercase tracking-widest"
                            >
                                <Download className="w-4 h-4 mr-2" /> Save PDF
                            </Button>
                        </div>
                    </GlassBox>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
