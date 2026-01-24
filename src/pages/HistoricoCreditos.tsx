import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowUpCircle, ArrowDownCircle, Gift, CreditCard, Sparkles } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type CreditTransaction = {
  id: string;
  amount: number;
  type: string;
  description: string | null;
  balance_after: number;
  created_at: string;
};

const typeConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  signup_bonus: {
    label: "Bônus de Cadastro",
    icon: <Gift className="w-4 h-4" />,
    color: "bg-watermelon-green/20 text-watermelon-green border-watermelon-green/30",
  },
  subscription: {
    label: "Assinatura",
    icon: <CreditCard className="w-4 h-4" />,
    color: "bg-watermelon-pink/20 text-watermelon-pink border-watermelon-pink/30",
  },
  image_generation: {
    label: "Geração de Imagem",
    icon: <Sparkles className="w-4 h-4" />,
    color: "bg-watermelon-coral/20 text-watermelon-coral border-watermelon-coral/30",
  },
  video_generation: {
    label: "Geração de Vídeo",
    icon: <Sparkles className="w-4 h-4" />,
    color: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  },
};

const HistoricoCreditos = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from("credit_transactions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error("Erro ao buscar transações:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeInfo = (type: string) => {
    return typeConfig[type] || {
      label: type,
      icon: <Sparkles className="w-4 h-4" />,
      color: "bg-muted text-muted-foreground border-border",
    };
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-28 pb-12">
          <div className="text-center py-20">
            <p className="text-muted-foreground">
              Faça login para ver seu histórico de créditos.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-28 pb-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-gradient-watermelon mb-2">
              Histórico de Créditos
            </h1>
            <p className="text-muted-foreground">
              Acompanhe todas as suas transações de créditos
            </p>
          </div>

          {/* Transactions Table */}
          <div className="glass-card rounded-2xl overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="mt-4 text-muted-foreground">Carregando...</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="p-8 text-center">
                <Sparkles className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Nenhuma transação encontrada.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Data</TableHead>
                    <TableHead className="text-muted-foreground">Tipo</TableHead>
                    <TableHead className="text-muted-foreground">Descrição</TableHead>
                    <TableHead className="text-right text-muted-foreground">Créditos</TableHead>
                    <TableHead className="text-right text-muted-foreground">Saldo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => {
                    const typeInfo = getTypeInfo(transaction.type);
                    const isPositive = transaction.amount > 0;

                    return (
                      <TableRow
                        key={transaction.id}
                        className="border-border/30 hover:bg-muted/30"
                      >
                        <TableCell className="font-medium">
                          {format(new Date(transaction.created_at), "dd MMM yyyy, HH:mm", {
                            locale: ptBR,
                          })}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`${typeInfo.color} flex items-center gap-1.5 w-fit`}
                          >
                            {typeInfo.icon}
                            {typeInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {transaction.description || "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={`flex items-center justify-end gap-1 font-semibold ${
                              isPositive ? "text-watermelon-green" : "text-watermelon-coral"
                            }`}
                          >
                            {isPositive ? (
                              <ArrowUpCircle className="w-4 h-4" />
                            ) : (
                              <ArrowDownCircle className="w-4 h-4" />
                            )}
                            {isPositive ? "+" : ""}
                            {transaction.amount}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {transaction.balance_after}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default HistoricoCreditos;
