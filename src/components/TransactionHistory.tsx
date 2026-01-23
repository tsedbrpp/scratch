import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History } from "lucide-react";

export interface Transaction {
    id: string;
    type: 'PURCHASE' | 'USAGE' | 'GRANT' | 'REFUND';
    amount: number;
    description?: string;
    createdAt: string | number | Date;
}

interface TransactionHistoryProps {
    transactions: Transaction[];
    className?: string;
}

export function TransactionHistory({ transactions, className }: TransactionHistoryProps) {
    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <History className="h-4 w-4" />
                    Recent Transactions
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {transactions.length === 0 ? (
                        <div className="text-sm text-slate-500 text-center py-8">
                            No recent transactions found.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {transactions.map((tx) => (
                                <div key={tx.id} className="flex justify-between items-center text-sm border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                                    <div>
                                        <div className="font-medium text-slate-900">
                                            {tx.type === 'PURCHASE' ? 'Credit Purchase' :
                                                tx.type === 'GRANT' ? 'Admin Grant' :
                                                    tx.type === 'REFUND' ? 'Refund' : 'Usage'}
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            {new Date(tx.createdAt).toLocaleDateString()} • {new Date(tx.createdAt).toLocaleTimeString()}
                                        </div>
                                    </div>
                                    <div className={`font-semibold ${tx.amount > 0 ? 'text-green-600' : 'text-slate-600'}`}>
                                        {tx.amount > 0 ? '+' : ''}{tx.amount}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
