import { useState } from "react";
import { Layout } from "@/Top/Component/Layout/Index";
import { Calculator, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { Button } from "@/Top/Component/UI/Button";
import { Container } from "@/Top/Component/UI/Container";

const NISAB_GOLD_GRAMS = 87.48;
const NISAB_SILVER_GRAMS = 612.36;
const ZAKAT_RATE = 0.025;

type WizardStep = 1 | 2 | 3 | 4 | 5;

const ZakatCalculatorPage = () => {
  const [step, setStep] = useState<WizardStep>(1);
  
  // Nisab settings
  const [goldPrice, setGoldPrice] = useState(70);
  const [silverPrice, setSilverPrice] = useState(0.85);
  
  // Wealth inputs
  const [cash, setCash] = useState(0);
  const [savings, setSavings] = useState(0);
  const [goldValue, setGoldValue] = useState(0);
  const [silverValue, setSilverValue] = useState(0);
  const [investments, setInvestments] = useState(0);
  const [debts, setDebts] = useState(0);

  const totalWealth = cash + savings + investments + goldValue + silverValue;
  const netWealth = Math.max(0, totalWealth - debts);
  const nisabGold = NISAB_GOLD_GRAMS * goldPrice;
  const nisabSilver = NISAB_SILVER_GRAMS * silverPrice;
  const nisab = Math.min(nisabGold, nisabSilver);
  const zakatDue = netWealth >= nisab ? netWealth * ZAKAT_RATE : 0;

  const goNext = () => {
    if (step < 5) setStep((step + 1) as WizardStep);
  };

  const goPrev = () => {
    if (step > 1) setStep((step - 1) as WizardStep);
  };

  const resetCalculator = () => {
    setStep(1);
    setGoldPrice(70);
    setSilverPrice(0.85);
    setCash(0);
    setSavings(0);
    setGoldValue(0);
    setSilverValue(0);
    setInvestments(0);
    setDebts(0);
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4, 5].map((s, idx) => (
        <div key={s} className="flex items-center">
          {/* Step Circle */}
          <div
            className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300
              ${step === s 
                ? "bg-black dark:bg-white text-white dark:text-black ring-2 ring-black/20 dark:ring-white/20" 
                : step > s 
                  ? "bg-[rgb(128,128,128)] text-white" 
                  : "bg-white dark:bg-black border-2 border-black dark:border-white text-black dark:text-white"
              }
            `}
          >
            {step > s ? (
              <Check className="h-4 w-4" />
            ) : (
              s
            )}
          </div>
          
          {/* Connecting Line (except after last step) */}
          {idx < 4 && (
            <div className="w-12 mx-1 relative">
              <div className="absolute inset-0 flex items-center">
                <div className={`h-0.5 w-full transition-all duration-500 ease-in-out ${
                  step > s ? "bg-[rgb(128,128,128)]" : "bg-muted"
                }`} />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-2">
              <h2 className="text-lg font-semibold mb-1">Nisab Threshold</h2>
              <p className="text-xs text-muted-foreground">
                Set current gold and silver prices per gram
              </p>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Gold price/g ($)</label>
                <input
                  type="number"
                  value={goldPrice}
                  onChange={(e) => setGoldPrice(Number(e.target.value))}
                  className="w-full px-4 py-2 rounded-[40px] bg-muted/30 border-2 border-black dark:border-white text-sm outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Silver price/g ($)</label>
                <input
                  type="number"
                  value={silverPrice}
                  onChange={(e) => setSilverPrice(Number(e.target.value))}
                  className="w-full px-4 py-2 rounded-[40px] bg-muted/30 border-2 border-black dark:border-white text-sm outline-none focus:border-primary transition-colors"
                />
              </div>
              <div className="p-3 rounded-[40px] bg-muted/30 mt-2">
                <p className="text-xs text-muted-foreground text-center">
                  Nisab threshold: <span className="font-semibold text-foreground">${nisab.toFixed(2)}</span>
                  <br />
                  (based on lower of gold/silver)
                </p>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-2">
              <h2 className="text-lg font-semibold mb-1">Cash & Savings</h2>
              <p className="text-xs text-muted-foreground">
                Enter the cash you have on hand and in bank accounts
              </p>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Cash in Hand ($)</label>
                <input
                  type="number"
                  value={cash || ""}
                  onChange={(e) => setCash(Number(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full px-4 py-2 rounded-[40px] bg-muted/30 border-2 border-black dark:border-white text-sm outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Bank Savings ($)</label>
                <input
                  type="number"
                  value={savings || ""}
                  onChange={(e) => setSavings(Number(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full px-4 py-2 rounded-[40px] bg-muted/30 border-2 border-black dark:border-white text-sm outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-2">
              <h2 className="text-lg font-semibold mb-1">Gold & Silver Value</h2>
              <p className="text-xs text-muted-foreground">
                Enter the value of your gold and silver
              </p>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Gold Value ($)</label>
                <input
                  type="number"
                  value={goldValue || ""}
                  onChange={(e) => setGoldValue(Number(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full px-4 py-2 rounded-[40px] bg-muted/30 border-2 border-black dark:border-white text-sm outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Silver Value ($)</label>
                <input
                  type="number"
                  value={silverValue || ""}
                  onChange={(e) => setSilverValue(Number(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full px-4 py-2 rounded-[40px] bg-muted/30 border-2 border-black dark:border-white text-sm outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="text-center mb-2">
              <h2 className="text-lg font-semibold mb-1">Investments & Debts</h2>
              <p className="text-xs text-muted-foreground">
                Enter your investments and any debts you owe
              </p>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Investments & Stocks ($)</label>
                <input
                  type="number"
                  value={investments || ""}
                  onChange={(e) => setInvestments(Number(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full px-4 py-2 rounded-[40px] bg-muted/30 border-2 border-black dark:border-white text-sm outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Debts Owed ($)</label>
                <input
                  type="number"
                  value={debts || ""}
                  onChange={(e) => setDebts(Number(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full px-4 py-2 rounded-[40px] bg-muted/30 border-2 border-black dark:border-white text-sm outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-lg font-semibold mb-2">Your Zakat Summary</h2>
              <p className="text-xs text-muted-foreground">
                Based on the information you provided
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="p-4 rounded-[40px] bg-muted/30">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Total Wealth</span>
                  <span className="font-semibold">${totalWealth.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Debts</span>
                  <span className="font-semibold text-destructive">-${debts.toFixed(2)}</span>
                </div>
                <div className="border-t border-border my-2" />
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Net Wealth</span>
                  <span className="font-bold text-lg">${netWealth.toFixed(2)}</span>
                </div>
              </div>

              <div className={`p-4 rounded-[40px] ${zakatDue > 0 ? "bg-primary/5 border border-primary/30" : "bg-muted/30"}`}>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Nisab Threshold</p>
                  <p className="text-sm font-mono mb-3">${nisab.toFixed(2)}</p>

                  {netWealth >= nisab ? (
                    <>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Zakat Due (2.5%)</p>
                      <p className="text-3xl font-bold text-primary">${zakatDue.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        May Allah accept your charity.
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Your wealth is below the Nisab threshold. No Zakat is due.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Button onClick={resetCalculator} variant="secondary" fullWidth>
              Calculate Again
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="container max-w-md mx-auto py-6 px-4">
        {/* Title in Container */}
        <Container className="!py-3 !px-4 mb-6 flex items-center gap-2 justify-center">
          <Calculator className="h-5 w-5 text-foreground" />
          <h1 className="text-lg font-bold">Zakat Calculator</h1>
        </Container>

        <Container className="!p-5">
          <StepIndicator />
          
          {renderStep()}

          {/* Navigation Buttons */}
          {step < 5 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
              {step > 1 ? (
                <Button onClick={goPrev} variant="secondary" className="gap-2">
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
              ) : (
                <div />
              )}
              <Button onClick={goNext} className="gap-2">
                Continue
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </Container>
      </div>
    </Layout>
  );
};

export default ZakatCalculatorPage;