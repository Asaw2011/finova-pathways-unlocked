import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Flame, Zap, Award, Trophy, Lock, CheckCircle2, ChevronRight, Target, Heart, Diamond, Banknote, Landmark, CreditCard, TrendingUp, PiggyBank, Shield, GraduationCap, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion } from "framer-motion";
import LearningPathModule from "@/components/learning-path/LearningPathModule";
import UnitQuiz from "@/components/learning-path/UnitQuiz";

import { useGameEconomy } from "@/contexts/GameEconomyContext";
import { Link } from "react-router-dom";

const moduleIcons = [Banknote, Landmark, CreditCard, TrendingUp, PiggyBank, Shield, GraduationCap];
const moduleColors = [
  { bg: "bg-primary", text: "text-primary", light: "bg-primary/10", border: "border-primary/30", hex: "hsl(101, 95%, 40%)" },
  { bg: "bg-duo-blue", text: "text-duo-blue", light: "bg-duo-blue/10", border: "border-duo-blue/30", hex: "hsl(199, 92%, 52%)" },
  { bg: "bg-duo-purple", text: "text-duo-purple", light: "bg-duo-purple/10", border: "border-duo-purple/30", hex: "hsl(271, 100%, 75%)" },
  { bg: "bg-duo-orange", text: "text-duo-orange", light: "bg-duo-orange/10", border: "border-duo-orange/30", hex: "hsl(33, 100%, 50%)" },
  { bg: "bg-duo-red", text: "text-duo-red", light: "bg-duo-red/10", border: "border-duo-red/30", hex: "hsl(0, 100%, 64%)" },
  { bg: "bg-duo-gold", text: "text-duo-gold", light: "bg-duo-gold/10", border: "border-duo-gold/30", hex: "hsl(45, 100%, 39%)" },
  { bg: "bg-primary", text: "text-primary", light: "bg-primary/10", border: "border-primary/30", hex: "hsl(101, 95%, 40%)" },
];

export const modules = [
  {
    id: "money-basics",
    title: "Money Basics",
    badge: "Money Master",
    badgeIcon: "wallet",
    lessons: [
      { id: "mb-1", title: "What Is Money?", xp: 10, content: "Money is a tool that helps us exchange value. It comes in many forms: cash, digital payments, and even cryptocurrency. Understanding money starts with knowing it's simply a medium of exchange — a way to trade your time and skills for goods and services.", takeaway: "Money is a tool for exchanging value, not just paper in your wallet.", quote: { text: "Money is only a tool. It will take you wherever you wish, but it will not replace you as the driver.", author: "Ayn Rand" }, example: "When you babysit for $15/hour, you're trading your time for money. When you buy lunch for $10, you're trading money for food. Money makes these exchanges simple.", quiz: [{ q: "What is the primary purpose of money?", options: ["To make you rich", "Medium of exchange", "A government control tool", "To collect in a bank"], answer: 1 }, { q: "Which is NOT a form of money?", options: ["Cash", "Digital payment", "Credit score", "Cryptocurrency"], answer: 2 }] },
      { id: "mb-2", title: "Where Your Money Goes", xp: 10, content: "Most people think they have a spending problem. In reality, they have a tracking problem. Money disappears through small purchases: food, online shopping, subscriptions, entertainment. Tracking spending for just 30 days can reveal patterns.", takeaway: "Awareness is the first step to financial control.", quote: { text: "Do not save what is left after spending, but spend what is left after saving.", author: "Warren Buffett" }, example: "If you spend $5 on coffee every weekday, that's $100/month or $1,200/year — enough for a weekend trip.", quiz: [{ q: "What's the FIRST step to controlling your finances?", options: ["Investing in stocks", "Tracking your spending", "Getting a credit card", "Opening a savings account"], answer: 1 }, { q: "Which of these is NOT a common money leak?", options: ["Subscriptions", "Coffee runs", "Emergency savings", "Impulse purchases"], answer: 2 }] },
      { id: "mb-3", title: "Budgeting Made Simple", xp: 10, content: "A budget is not about restriction — it's about planning your money before you spend it. The 50/30/20 rule divides your income: 50% for needs, 30% for wants, and 20% for savings.", takeaway: "Pay yourself first by saving before spending.", quote: { text: "A budget is telling your money where to go instead of wondering where it went.", author: "Dave Ramsey" }, example: "Using the 50/30/20 rule on a $2,000 paycheck: $1,000 for needs, $600 for wants, $400 for savings.", quiz: [{ q: "What is the 50/30/20 rule?", options: ["Save 50%, spend 30%, invest 20%", "Needs 50%, wants 30%, savings 20%", "Taxes 50%, rent 30%, food 20%", "Invest 50%, save 30%, spend 20%"], answer: 1 }, { q: "What does 'pay yourself first' mean?", options: ["Buy yourself a gift", "Save before spending", "Take a salary advance", "Pay your own bills first"], answer: 1 }] },
      { id: "mb-4", title: "Needs vs Wants", xp: 10, content: "Needs are things required to live: food, housing, medicine, transportation. Wants improve your life but are optional: new sneakers, streaming services, gaming upgrades. Smart money decisions come from knowing the difference.", takeaway: "Distinguishing needs from wants is essential for smart spending.", quote: { text: "Too many people spend money they earned to buy things they don't want to impress people they don't like.", author: "Will Rogers" }, example: "Your phone is a need for communication. The latest $1,200 model when your current phone works fine? That's a want.", quiz: [{ q: "Which is a NEED?", options: ["Netflix subscription", "New gaming console", "Groceries", "Designer shoes"], answer: 2 }, { q: "Which is a WANT?", options: ["Rent", "Medicine", "Transportation to work", "Latest smartphone"], answer: 3 }] },
      { id: "mb-5", title: "Emergency Funds", xp: 10, content: "An emergency fund protects you from unexpected expenses: car repair, medical costs, laptop replacement. Recommended starting goal: $500–$1,000. Start small — even $25/month adds up.", takeaway: "Savings create financial security.", quote: { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" }, example: "Without an emergency fund, a $600 car repair could mean credit card debt at 24% interest — costing you $744 total.", quiz: [{ q: "What's a good starting emergency fund goal?", options: ["$50", "$500–$1,000", "$10,000", "$100,000"], answer: 1 }, { q: "Which is an emergency expense?", options: ["Concert tickets", "New shoes", "Car breakdown repair", "Vacation"], answer: 2 }] },
      { id: "mb-6", title: "Setting Financial Goals", xp: 10, content: "Goals give your money purpose. Short-term goals (1-12 months): save for headphones, a trip. Medium-term (1-5 years): car, college fund. Long-term (5+ years): house, retirement. Write them down — you're 42% more likely to achieve written goals.", takeaway: "A goal without a plan is just a wish.", quote: { text: "The secret of getting ahead is getting started.", author: "Mark Twain" }, example: "Goal: Save $600 for a new phone in 6 months = $100/month or $25/week. That's skipping 2-3 takeout meals per week.", quiz: [{ q: "A short-term financial goal is typically:", options: ["10+ years", "1-12 months", "30 years", "A lifetime"], answer: 1 }, { q: "Writing goals down makes you:", options: ["Less motivated", "42% more likely to achieve them", "No difference", "Stressed out"], answer: 1 }] },
    ],
    unitQuiz: [
      { q: "What is the 50/30/20 rule?", options: ["Save 50%, spend 50%", "Needs 50%, wants 30%, savings 20%", "Invest everything", "Spend 80%, save 20%"], answer: 1 },
      { q: "An emergency fund should ideally cover:", options: ["1 week of expenses", "3-6 months of expenses", "Only rent", "Nothing specific"], answer: 1 },
      { q: "Tracking spending helps you:", options: ["Spend more", "Find where money goes", "Avoid taxes", "Get more credit"], answer: 1 },
      { q: "Which is a financial NEED?", options: ["New video game", "Concert tickets", "Housing", "Streaming service"], answer: 2 },
      { q: "What does 'pay yourself first' mean?", options: ["Buy treats first", "Save before spending on wants", "Pay bills last", "Borrow money"], answer: 1 },
    ],
  },
  {
    id: "banking-saving", title: "Banking & Saving", badge: "Savings Pro", badgeIcon: "piggy-bank",
    lessons: [
      { id: "bs-1", title: "Types of Bank Accounts", xp: 10, content: "Banks offer different accounts for different purposes. Checking accounts are for daily spending. Savings accounts are for money you want to keep and grow with interest.", takeaway: "Use checking for spending, savings for growing your money.", quote: { text: "The habit of saving is itself an education.", author: "T.T. Munger" }, example: "Keep $500 in checking for daily use, and $2,000 in a high-yield savings account earning 4.5% APY.", quiz: [{ q: "A checking account is best for:", options: ["Long-term saving", "Daily spending", "Investing", "Retirement"], answer: 1 }, { q: "Savings accounts typically offer:", options: ["No interest", "Interest on your balance", "Free stocks", "Credit cards"], answer: 1 }] },
      { id: "bs-2", title: "How Interest Works", xp: 10, content: "Interest is the price of using money. When you save, the bank pays YOU interest. When you borrow, YOU pay the bank interest. APY shows how much your savings grow per year.", takeaway: "Interest can work for you (savings) or against you (debt).", quote: { text: "Compound interest is the eighth wonder of the world.", author: "Albert Einstein" }, example: "$1,000 in a savings account at 4.5% APY earns $45 in the first year.", quiz: [{ q: "APY stands for:", options: ["Annual Payment Yield", "Annual Percentage Yield", "Account Profit Year", "Average Pay Yearly"], answer: 1 }, { q: "When you have a savings account, interest works:", options: ["Against you", "For you", "Not at all", "Only on weekdays"], answer: 1 }] },
      { id: "bs-3", title: "Online vs Traditional Banks", xp: 10, content: "Online banks often offer higher interest rates because they don't pay for physical branches. Many people use both strategically.", takeaway: "Online banks often offer better rates; use both strategically.", quote: { text: "Do not put all your eggs in one basket.", author: "Andrew Carnegie" }, example: "Traditional bank savings: 0.01% APY. Online bank savings: 4.5% APY.", quiz: [{ q: "Online banks typically offer:", options: ["Lower interest rates", "Higher interest rates", "No accounts", "Physical branches"], answer: 1 }, { q: "A smart strategy is to:", options: ["Use only one bank", "Use online for savings, traditional for checking", "Avoid banks entirely", "Keep cash at home"], answer: 1 }] },
      { id: "bs-4", title: "Protecting Your Money", xp: 10, content: "FDIC insurance protects your bank deposits up to $250,000. Never share your PIN or banking passwords.", takeaway: "Your money is protected, but you must protect your accounts.", quote: { text: "It takes 20 years to build a reputation and five minutes to ruin it.", author: "Warren Buffett" }, example: "If your bank fails, FDIC insurance ensures you get back every dollar up to $250,000.", quiz: [{ q: "FDIC insures deposits up to:", options: ["$100,000", "$250,000", "$500,000", "$1,000,000"], answer: 1 }, { q: "To protect your accounts, you should:", options: ["Share passwords with friends", "Use the same password everywhere", "Enable two-factor authentication", "Write PIN on your card"], answer: 2 }] },
      { id: "bs-5", title: "Saving Strategies That Work", xp: 10, content: "Automate savings by setting up automatic transfers on payday. Use the round-up method.", takeaway: "Automation removes willpower from saving — make it effortless.", quote: { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" }, example: "Automating $50/week in savings means $2,600/year without thinking about it.", quiz: [{ q: "The best way to save consistently is:", options: ["Remember to transfer manually", "Automate savings", "Save whatever's left", "Wait for a bonus"], answer: 1 }, { q: "Round-up savings works by:", options: ["Rounding down purchases", "Saving the difference to the next dollar", "Doubling your purchase", "Skipping purchases"], answer: 1 }] },
    ],
    unitQuiz: [
      { q: "FDIC insurance covers deposits up to:", options: ["$100,000", "$250,000", "$1 million", "$50,000"], answer: 1 },
      { q: "APY stands for:", options: ["Average Pay Yearly", "Annual Percentage Yield", "Account Profit Yield", "Annual Price Yield"], answer: 1 },
      { q: "Online banks typically offer:", options: ["No services", "Lower rates", "Higher savings rates", "More ATMs"], answer: 2 },
      { q: "The best saving strategy is:", options: ["Save what's left", "Automate transfers", "Skip saving", "Only save big amounts"], answer: 1 },
      { q: "A checking account is for:", options: ["Long-term investing", "Daily transactions", "Retirement", "Earning high interest"], answer: 1 },
    ],
  },
  {
    id: "budgeting-spending", title: "Budgeting & Spending", badge: "Budget Boss", badgeIcon: "calculator",
    lessons: [
      { id: "bsp-1", title: "Creating Your First Budget", xp: 10, content: "Start by listing your income sources. Then list all expenses: fixed and variable. Subtract expenses from income.", takeaway: "A budget is a plan for every dollar you earn.", quote: { text: "Beware of little expenses; a small leak will sink a great ship.", author: "Benjamin Franklin" }, example: "Income: $1,500. Fixed expenses: $800. Variable expenses: $500. That leaves $200 for savings.", quiz: [{ q: "The first step in budgeting is:", options: ["Cutting all spending", "Listing your income", "Opening a credit card", "Investing"], answer: 1 }, { q: "If expenses exceed income, you should:", options: ["Borrow more", "Cut wants first", "Ignore it", "Increase fixed expenses"], answer: 1 }] },
      { id: "bsp-2", title: "Fixed vs Variable Expenses", xp: 10, content: "Fixed expenses stay the same each month: rent, car payment, insurance. Variable expenses change: groceries, gas, entertainment.", takeaway: "Know which expenses you can control — and start there.", quote: { text: "It's not your salary that makes you rich, it's your spending habits.", author: "Charles A. Jaffe" }, example: "Fixed: Rent $800 + Phone $60 + Insurance $100 = $960. Variable: Groceries $300 + Dining $200 + Fun $150 = $650.", quiz: [{ q: "Which is a fixed expense?", options: ["Groceries", "Dining out", "Rent", "Entertainment"], answer: 2 }, { q: "To save money quickly, start by cutting:", options: ["Fixed expenses", "Variable expenses", "All expenses", "Income"], answer: 1 }] },
      { id: "bsp-3", title: "The Impulse Purchase Trap", xp: 10, content: "Impulse purchases are unplanned buys driven by emotion. The 24-hour rule: wait a day before buying anything non-essential over $20.", takeaway: "Sleep on it before you spend it.", quote: { text: "Wealth consists not in having great possessions, but in having few wants.", author: "Epictetus" }, example: "The average American spends $5,400/year on impulse purchases.", quiz: [{ q: "The 24-hour rule suggests:", options: ["Buy immediately", "Wait before non-essential purchases", "Only shop online", "Never buy anything"], answer: 1 }, { q: "Impulse purchases are driven by:", options: ["Careful planning", "Emotion", "Budgets", "Savings goals"], answer: 1 }] },
      { id: "bsp-4", title: "Subscription Awareness", xp: 10, content: "Small monthly subscriptions add up fast. Audit your subscriptions quarterly. Cancel what you don't actively use.", takeaway: "Small subscriptions can quietly drain your money.", quote: { text: "Beware of little expenses; a small leak will sink a great ship.", author: "Benjamin Franklin" }, example: "The average person has 12 subscriptions totaling $219/month.", quiz: [{ q: "$15/month in subscriptions costs per year:", options: ["$150", "$180", "$120", "$200"], answer: 1 }, { q: "How often should you review subscriptions?", options: ["Never", "Every few months", "Once a decade", "Only when broke"], answer: 1 }] },
      { id: "bsp-5", title: "Smart Shopping Strategies", xp: 10, content: "Never buy the first option you see. Compare prices across at least 3 sources. Use cashback apps.", takeaway: "A few minutes of research can save you hundreds.", quote: { text: "Price is what you pay. Value is what you get.", author: "Warren Buffett" }, example: "Comparing prices on a $300 laptop across 3 stores could save $40-80.", quiz: [{ q: "Before buying, you should:", options: ["Buy the first option", "Compare at least 3 sources", "Always buy the cheapest", "Only buy brand names"], answer: 1 }, { q: "Generic brands are often:", options: ["Lower quality", "Same quality, lower price", "More expensive", "Not available"], answer: 1 }] },
    ],
    unitQuiz: [
      { q: "The 24-hour rule helps you avoid:", options: ["Saving too much", "Impulse purchases", "Paying bills", "Earning money"], answer: 1 },
      { q: "Which is a variable expense?", options: ["Rent", "Car payment", "Groceries", "Insurance"], answer: 2 },
      { q: "How often should you audit subscriptions?", options: ["Never", "Every few months", "Every 10 years", "Only once"], answer: 1 },
      { q: "The first step in creating a budget is:", options: ["Invest everything", "List your income", "Get a loan", "Cancel all subscriptions"], answer: 1 },
      { q: "To comparison shop effectively:", options: ["Buy the first thing you see", "Check at least 3 sources", "Only buy online", "Ignore sales"], answer: 1 },
    ],
  },
  {
    id: "credit-debt", title: "Credit & Debt", badge: "Credit Pro", badgeIcon: "credit-card",
    lessons: [
      { id: "cd-1", title: "What Is Credit?", xp: 10, content: "Credit is borrowed money that you promise to pay back. Building good credit early opens doors.", takeaway: "Credit is borrowed trust — build it wisely.", quote: { text: "Good credit is a financial superpower.", author: "Morgan Housel" }, example: "A good credit score can save you $50,000+ in interest over a 30-year mortgage.", quiz: [{ q: "Credit is essentially:", options: ["Free money", "Borrowed money you repay", "A gift from banks", "Your salary"], answer: 1 }, { q: "Building good credit helps you:", options: ["Avoid all debt", "Get better loan rates", "Never pay bills", "Skip rent payments"], answer: 1 }] },
      { id: "cd-2", title: "Credit Scores Explained", xp: 10, content: "A credit score ranges from 300–850. Five factors: Payment history (35%), amounts owed (30%), length (15%), new credit (10%), mix (10%).", takeaway: "Your credit score follows you for life — build it early.", quote: { text: "The borrower is slave to the lender.", author: "Proverbs 22:7" }, example: "A 750 credit score could save you $50,000 in interest over a mortgage.", quiz: [{ q: "Credit score range is:", options: ["0–500", "100–850", "300–850", "500–1000"], answer: 2 }, { q: "The biggest factor in your credit score is:", options: ["Length of history", "Payment history", "Credit mix", "New credit"], answer: 1 }] },
      { id: "cd-3", title: "Debit vs Credit Cards", xp: 10, content: "Debit cards use money from your bank account instantly. Credit cards borrow money you repay later.", takeaway: "Know the difference to avoid overspending.", quote: { text: "Compound interest is the eighth wonder of the world.", author: "Albert Einstein" }, example: "Using a debit card for a $50 purchase immediately takes $50 from your account.", quiz: [{ q: "Debit cards pull money from:", options: ["A loan", "Your bank account", "Your credit score", "Future earnings"], answer: 1 }, { q: "To avoid credit card interest:", options: ["Pay minimum only", "Pay full balance monthly", "Close the card", "Ignore statements"], answer: 1 }] },
      { id: "cd-4", title: "How Interest Charges Work", xp: 10, content: "APR is the yearly interest rate on borrowed money. Credit card APRs average 20-25%.", takeaway: "Pay in full each month to avoid interest charges.", quote: { text: "Beware of little expenses.", author: "Benjamin Franklin" }, example: "A $1,000 balance at 24% APR with $25 minimum payments takes 62 months.", quiz: [{ q: "APR stands for:", options: ["Annual Payment Rate", "Annual Percentage Rate", "Average Payment Required", "Automatic Payment Refund"], answer: 1 }, { q: "To minimize interest on credit cards:", options: ["Pay minimums only", "Pay the full balance", "Open more cards", "Skip payments"], answer: 1 }] },
      { id: "cd-5", title: "Avoiding Debt Traps", xp: 10, content: "Debt becomes dangerous when interest compounds and minimum payments are ignored. Watch out for payday loans.", takeaway: "If borrowing seems too easy, it's probably too expensive.", quote: { text: "The only man who sticks closer to you in adversity than a friend is a creditor.", author: "Unknown" }, example: "A $400 payday loan can cost $460 in just two weeks — that's 400%+ APR.", quiz: [{ q: "Which is a debt trap?", options: ["Paying full balance", "Payday loans", "Emergency savings", "Low-interest student loans"], answer: 1 }, { q: "Minimum payments mostly cover:", options: ["The principal", "Interest charges", "Future purchases", "Insurance fees"], answer: 1 }] },
    ],
    unitQuiz: [
      { q: "The biggest factor in your credit score is:", options: ["Credit mix", "Payment history", "New credit", "Length of history"], answer: 1 },
      { q: "Credit card APRs typically range:", options: ["1-5%", "5-10%", "20-25%", "50-100%"], answer: 2 },
      { q: "Payday loans are dangerous because:", options: ["They build credit", "They have 400%+ APR", "They're free", "Banks require them"], answer: 1 },
      { q: "Debit cards take money from:", options: ["Credit line", "Future income", "Your bank account", "Your credit score"], answer: 2 },
      { q: "To avoid credit card interest:", options: ["Pay minimum", "Pay full balance monthly", "Get more cards", "Ignore statements"], answer: 1 },
    ],
  },
  {
    id: "investing-fundamentals", title: "Investing Fundamentals", badge: "Investing Starter", badgeIcon: "trending-up",
    lessons: [
      { id: "if-1", title: "Why Invest?", xp: 10, content: "Investing means putting money into assets that can grow over time. Historically, the stock market returns ~7-10% per year.", takeaway: "Investing grows your money; saving just protects it.", quote: { text: "The stock market is a device for transferring money from the impatient to the patient.", author: "Warren Buffett" }, example: "$5,000 invested at 7% earns $350/year — 14x more than a savings account.", quiz: [{ q: "Investing is best for:", options: ["Next week's expenses", "Long-term wealth building", "Emergency funds", "Daily spending"], answer: 1 }, { q: "The stock market historically returns:", options: ["1-2% per year", "7-10% per year", "50% per year", "0%"], answer: 1 }] },
      { id: "if-2", title: "Stocks 101", xp: 10, content: "A stock represents ownership in a company. When a company grows, its stock price usually rises.", takeaway: "Owning stock means owning a piece of a company.", quote: { text: "In the short run, the market is a voting machine, but in the long run, it is a weighing machine.", author: "Benjamin Graham" }, example: "If you bought $1,000 of Apple stock in 2010, it would be worth over $15,000 today.", quiz: [{ q: "A stock represents:", options: ["A loan to a company", "Ownership in a company", "A government bond", "A savings account"], answer: 1 }, { q: "Fractional shares let you:", options: ["Buy part of a stock for less money", "Get free stocks", "Avoid all risk", "Skip market hours"], answer: 0 }] },
      { id: "if-3", title: "Bonds & Fixed Income", xp: 10, content: "Bonds are loans you make to governments or companies. They pay you back with interest over a set period.", takeaway: "Bonds are the stable part of your portfolio.", quote: { text: "The four most dangerous words in investing are: 'This time it's different.'", author: "Sir John Templeton" }, example: "A $1,000 government bond at 3% pays you $30/year for 10 years.", quiz: [{ q: "Bonds are essentially:", options: ["Ownership in a company", "Loans you make to others", "Savings accounts", "Insurance policies"], answer: 1 }, { q: "Compared to stocks, bonds are:", options: ["Higher risk, higher return", "Lower risk, lower return", "No risk, no return", "Exactly the same"], answer: 1 }] },
      { id: "if-4", title: "ETFs & Index Funds", xp: 10, content: "ETFs bundle many stocks together. An S&P 500 ETF gives you exposure to 500 of America's largest companies.", takeaway: "ETFs let you invest in many companies at once.", quote: { text: "Don't look for the needle in the haystack. Just buy the haystack!", author: "John Bogle" }, example: "An S&P 500 ETF gives you exposure to Apple, Microsoft, Google and 497 other companies.", quiz: [{ q: "ETF stands for:", options: ["Electronic Transfer Fund", "Exchange-Traded Fund", "Extra Tax Filing", "Emergency Trust Fund"], answer: 1 }, { q: "Index funds are recommended for beginners because:", options: ["They guarantee profits", "They provide diversification with low fees", "They're free", "They never lose value"], answer: 1 }] },
      { id: "if-5", title: "The Power of Compound Growth", xp: 10, content: "Compound growth means your returns earn returns. Starting earlier makes a massive difference.", takeaway: "Time is the most powerful tool in investing — start now.", quote: { text: "Compound interest is the eighth wonder of the world.", author: "Albert Einstein" }, example: "Starting at 18 vs 28 with $100/month at 7%: $400K vs $230K by age 60.", quiz: [{ q: "Compound growth earns returns on:", options: ["Only the original amount", "Interest + principal", "Just the interest", "Nothing"], answer: 1 }, { q: "Starting to invest earlier means:", options: ["Less total growth", "More time for compounding", "Higher risk", "Lower returns"], answer: 1 }] },
    ],
    unitQuiz: [
      { q: "ETFs provide:", options: ["Guaranteed returns", "Diversification", "Zero risk", "Free money"], answer: 1 },
      { q: "Compound growth benefits most from:", options: ["High risk", "Time", "Day trading", "Timing the market"], answer: 1 },
      { q: "Bonds are:", options: ["Ownership in companies", "Loans you make to issuers", "Savings accounts", "Insurance"], answer: 1 },
      { q: "The stock market historically returns:", options: ["0-1%", "7-10% annually", "50% guaranteed", "100% per year"], answer: 1 },
      { q: "Fractional shares allow you to:", options: ["Get free stocks", "Buy part of expensive stocks", "Avoid risk", "Skip fees"], answer: 1 },
    ],
  },
  {
    id: "building-wealth", title: "Building Wealth", badge: "Wealth Builder", badgeIcon: "gem",
    lessons: [
      { id: "bw-1", title: "Income vs Wealth", xp: 10, content: "Income is money you earn; wealth is money you keep and grow. High income doesn't guarantee wealth.", takeaway: "It's not what you earn, it's what you keep.", quote: { text: "Wealth is not about having a lot of money; it's about having a lot of options.", author: "Chris Rock" }, example: "A person earning $50K who saves $10K/year builds more wealth than someone earning $150K who spends it all.", quiz: [{ q: "Wealth is measured by:", options: ["Your salary", "Assets minus liabilities", "Your job title", "How much you spend"], answer: 1 }, { q: "High income guarantees wealth:", options: ["Always true", "Sometimes true", "False — spending matters more", "Only for millionaires"], answer: 2 }] },
      { id: "bw-2", title: "Multiple Income Streams", xp: 10, content: "Relying on one income source is risky. Side hustles, freelancing, and investments create financial resilience.", takeaway: "Don't put all your eggs in one basket — diversify income.", quote: { text: "Never depend on a single income.", author: "Warren Buffett" }, example: "$200/month side income invested at 7% for 20 years grows to over $100,000.", quiz: [{ q: "Multiple income streams provide:", options: ["More stress", "Financial resilience", "Tax problems always", "Less free time always"], answer: 1 }, { q: "Passive income comes from:", options: ["Active work only", "Investments and assets", "Borrowing money", "Government aid"], answer: 1 }] },
      { id: "bw-3", title: "The Millionaire Mindset", xp: 10, content: "Most millionaires are first-generation wealthy — they built it themselves through discipline.", takeaway: "Wealth is built through discipline, not luck.", quote: { text: "Someone's sitting in the shade today because someone planted a tree a long time ago.", author: "Warren Buffett" }, example: "The average millionaire drives a 4-year-old car and invests 15-20% of income.", quiz: [{ q: "Most millionaires build wealth through:", options: ["Lottery winnings", "Discipline over decades", "Inheritance only", "Day trading"], answer: 1 }, { q: "Lifestyle inflation means:", options: ["Saving more as you earn more", "Spending more as you earn more", "Investing all raises", "Reducing expenses"], answer: 1 }] },
      { id: "bw-4", title: "Avoiding Lifestyle Inflation", xp: 10, content: "When your income rises, resist the urge to upgrade everything. Save 50% of every raise.", takeaway: "Save your raises — live on your old salary, invest the new money.", quote: { text: "It's not your salary that makes you rich, it's your spending habits.", author: "Charles A. Jaffe" }, example: "Getting a $5,000 raise? If you save $2,500 and invest at 7% for 20 years, that single raise becomes $102,000.", quiz: [{ q: "When you get a raise, you should:", options: ["Upgrade your car immediately", "Save at least 50% of the increase", "Spend it all as a reward", "Quit your job"], answer: 1 }, { q: "Lifestyle inflation is:", options: ["Good for building wealth", "The #1 wealth killer for earners", "Unavoidable", "Only for rich people"], answer: 1 }] },
      { id: "bw-5", title: "Net Worth Tracking", xp: 10, content: "Net worth = assets minus liabilities. Track it monthly. The trend matters more than the number.", takeaway: "What gets measured gets managed — track your net worth.", quote: { text: "You can't manage what you don't measure.", author: "Peter Drucker" }, example: "Age 22: Savings $2,000 - Student Loans $15,000 = Net Worth -$13,000. Age 25: $7,000. The trend is what matters!", quiz: [{ q: "Net worth equals:", options: ["Income minus expenses", "Assets minus liabilities", "Salary times years worked", "Total savings only"], answer: 1 }, { q: "A negative net worth means:", options: ["You're a failure", "You should give up", "Your liabilities exceed assets — focus on the trend", "You can never build wealth"], answer: 2 }] },
    ],
    unitQuiz: [
      { q: "Net worth is:", options: ["Your salary", "Assets minus liabilities", "Money in your wallet", "Total income"], answer: 1 },
      { q: "When you get a raise, you should:", options: ["Spend it all", "Save at least 50%", "Buy a new car", "Quit your job"], answer: 1 },
      { q: "Most millionaires are:", options: ["Born wealthy", "Lottery winners", "First-generation, self-made", "Day traders"], answer: 2 },
      { q: "Passive income comes from:", options: ["A 9-5 job", "Investments and assets", "Borrowing", "Gambling"], answer: 1 },
      { q: "Lifestyle inflation is:", options: ["Good for you", "Spending more as you earn more", "Saving more", "Investing raises"], answer: 1 },
    ],
  },
  {
    id: "financial-independence", title: "Financial Independence", badge: "Independence Champion", badgeIcon: "crown",
    lessons: [
      { id: "fi-1", title: "What Is Financial Independence?", xp: 10, content: "Financial independence means having enough income from investments to cover living expenses without needing to work.", takeaway: "Financial freedom is a journey, not a destination.", quote: { text: "The goal isn't more money. The goal is living life on your terms.", author: "Chris Brogan" }, example: "If your expenses are $3,000/month and your investments generate $3,500/month — you're financially independent.", quiz: [{ q: "Financial independence means:", options: ["Being rich", "Not needing a paycheck to survive", "Having no expenses", "Winning the lottery"], answer: 1 }, { q: "The first step is:", options: ["Quitting your job", "Spending less than you earn", "Buying luxury items", "Taking on debt"], answer: 1 }] },
      { id: "fi-2", title: "The FIRE Movement", xp: 10, content: "FIRE = Financial Independence, Retire Early. Save 50-70% of income, invest aggressively.", takeaway: "You don't need to retire early — but the principles create freedom.", quote: { text: "Retirement is when you stop sacrificing today for an imaginary tomorrow.", author: "Naval Ravikant" }, example: "Saving 50% of a $60,000 salary = $30,000/year invested. At 7%, that's ~$420,000 in 10 years.", quiz: [{ q: "FIRE stands for:", options: ["Financial Income and Real Estate", "Financial Independence, Retire Early", "Free Income for Retirement Earnings", "Fund Investments and Reduce Expenses"], answer: 1 }, { q: "FIRE principles are useful even if you:", options: ["Never want to retire", "Don't want to retire early", "Are already retired", "Don't save"], answer: 1 }] },
      { id: "fi-3", title: "Retirement Accounts", xp: 10, content: "401(k): employer-sponsored, often with matching. IRA: individual account with tax benefits. Start contributing early.", takeaway: "Employer match = free money. Never leave it on the table.", quote: { text: "The best time to start was yesterday. The next best time is today.", author: "Unknown" }, example: "If your employer matches 50% up to 6% of salary on $50,000: contribute $3,000, get $1,500 free.", quiz: [{ q: "Employer matching in a 401(k) is:", options: ["A loan", "Free money", "A tax penalty", "Optional for employers"], answer: 1 }, { q: "Roth accounts are taxed:", options: ["When you withdraw", "When you contribute", "Never", "Twice"], answer: 1 }] },
      { id: "fi-4", title: "Taxes & Smart Planning", xp: 10, content: "Understanding taxes helps you keep more money. Tax-advantaged accounts reduce your tax bill.", takeaway: "Understanding taxes puts money back in your pocket.", quote: { text: "In this world nothing can be said to be certain, except death and taxes.", author: "Benjamin Franklin" }, example: "Contributing $6,000 to a Traditional IRA in the 22% tax bracket saves you $1,320 in taxes.", quiz: [{ q: "Tax deductions:", options: ["Increase taxes owed", "Lower taxable income", "Are illegal", "Only apply to businesses"], answer: 1 }, { q: "Tax credits:", options: ["Lower taxable income", "Directly reduce taxes owed", "Increase your salary", "Only help the wealthy"], answer: 1 }] },
      { id: "fi-5", title: "Your Financial Action Plan", xp: 10, content: "Start today: 1) Track spending. 2) Create a budget. 3) Build emergency fund. 4) Pay off high-interest debt. 5) Start investing.", takeaway: "The best financial plan is the one you actually start today.", quote: { text: "The journey of a thousand miles begins with a single step.", author: "Lao Tzu" }, example: "Starting with just $25/month invested at 7% at age 18: by age 60 you'll have over $100,000.", quiz: [{ q: "The first step in a financial plan is:", options: ["Invest in crypto", "Track your spending", "Quit your job", "Get a credit card"], answer: 1 }, { q: "What matters most is:", options: ["Starting with a large amount", "Starting today, even with small amounts", "Waiting until you earn more", "Timing the market"], answer: 1 }] },
    ],
    unitQuiz: [
      { q: "FIRE stands for:", options: ["Fund Investments Regularly Early", "Financial Independence, Retire Early", "Free Income Requires Effort", "Future Investments and Returns Explained"], answer: 1 },
      { q: "Employer 401(k) matching is:", options: ["A loan", "Free money", "A tax", "Optional for you"], answer: 1 },
      { q: "The best time to start investing is:", options: ["When you're 50", "After you're debt-free", "As early as possible", "When the market is low"], answer: 2 },
      { q: "Tax credits directly:", options: ["Increase income", "Reduce taxes owed", "Add to your debt", "Lower your credit score"], answer: 1 },
      { q: "Financial independence means:", options: ["Being a millionaire", "Not needing a paycheck to live", "Having no bills", "Retirement age"], answer: 1 },
    ],
  },
];

const LearningPath = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { hearts, gems, canDoLessons } = useGameEconomy();
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [activeLesson, setActiveLesson] = useState<string | null>(null);
  const [showUnitQuiz, setShowUnitQuiz] = useState<string | null>(null);

  const { data: xpRecords } = useQuery({
    queryKey: ["user-xp", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("user_xp").select("*").eq("user_id", user!.id);
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: streak } = useQuery({
    queryKey: ["user-streak", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("user_streaks").select("*").eq("user_id", user!.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const { data: badges } = useQuery({
    queryKey: ["user-badges", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("user_badges").select("*").eq("user_id", user!.id);
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: certificates } = useQuery({
    queryKey: ["certificates", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("certificates").select("*").eq("user_id", user!.id);
      return data ?? [];
    },
    enabled: !!user,
  });

  const completedLessons = new Set(xpRecords?.filter(x => x.source === "lesson").map(x => x.source_id) ?? []);
  const completedQuizzes = new Set(xpRecords?.filter(x => x.source === "unit-quiz").map(x => x.source_id) ?? []);
  const totalXP = xpRecords?.reduce((sum, x) => sum + x.xp_amount, 0) ?? 0;

  const completeLessonMutation = useMutation({
    mutationFn: async ({ lessonId, xp, moduleId, badgeName }: { lessonId: string; xp: number; moduleId: string; badgeName: string }) => {
      if (!user) throw new Error("Not authenticated");
      await supabase.from("user_xp").insert({ user_id: user.id, xp_amount: xp, source: "lesson", source_id: lessonId });
      const today = new Date().toISOString().split("T")[0];
      const { data: existingStreak } = await supabase.from("user_streaks").select("*").eq("user_id", user.id).maybeSingle();
      if (existingStreak) {
        const lastDate = existingStreak.last_activity_date;
        const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
        let newStreak = existingStreak.current_streak;
        if (lastDate === yesterday) newStreak += 1;
        else if (lastDate !== today) newStreak = 1;
        await supabase.from("user_streaks").update({
          current_streak: newStreak, longest_streak: Math.max(newStreak, existingStreak.longest_streak),
          last_activity_date: today, updated_at: new Date().toISOString(),
        }).eq("user_id", user.id);
      } else {
        await supabase.from("user_streaks").insert({ user_id: user.id, current_streak: 1, longest_streak: 1, last_activity_date: today });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-xp"] });
      queryClient.invalidateQueries({ queryKey: ["user-streak"] });
      queryClient.invalidateQueries({ queryKey: ["user-badges"] });
    },
  });

  const completeUnitQuizMutation = useMutation({
    mutationFn: async ({ moduleId, badgeName, badgeIcon }: { moduleId: string; badgeName: string; badgeIcon: string }) => {
      if (!user) throw new Error("Not authenticated");
      await supabase.from("user_xp").insert({ user_id: user.id, xp_amount: 50, source: "unit-quiz", source_id: moduleId });
      try { await supabase.from("user_badges").insert({ user_id: user.id, badge_name: badgeName, badge_icon: badgeIcon }); } catch (_) {}
      const certNumber = `FINOVA-${moduleId.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
      try { await supabase.from("certificates").insert({ user_id: user.id, course_id: moduleId, certificate_number: certNumber, score: 100 }); } catch (_) {}
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-xp"] });
      queryClient.invalidateQueries({ queryKey: ["user-badges"] });
      queryClient.invalidateQueries({ queryKey: ["certificates"] });
      toast.success("Certificate earned! 🎓");
    },
  });

  const isLessonUnlocked = (moduleIndex: number, lessonIndex: number) => {
    if (moduleIndex === 0 && lessonIndex === 0) return true;
    if (lessonIndex > 0) {
      const prevLesson = modules[moduleIndex].lessons[lessonIndex - 1];
      return completedLessons.has(prevLesson.id);
    }
    const prevModule = modules[moduleIndex - 1];
    return prevModule.lessons.every(l => completedLessons.has(l.id)) && completedQuizzes.has(prevModule.id);
  };

  const isUnitQuizUnlocked = (moduleIndex: number) => {
    return modules[moduleIndex].lessons.every(l => completedLessons.has(l.id));
  };

  const activeModuleData = modules.find(m => m.id === activeModule);
  const activeLessonData = activeModuleData?.lessons.find(l => l.id === activeLesson);

  if (showUnitQuiz) {
    const mod = modules.find(m => m.id === showUnitQuiz);
    const mi = modules.findIndex(m => m.id === showUnitQuiz);
    if (mod) {
      return (
        <UnitQuiz unitTitle={mod.title} questions={mod.unitQuiz} sectionColor={moduleColors[mi % moduleColors.length].hex}
          isCompleted={completedQuizzes.has(mod.id)}
          onComplete={() => { completeUnitQuizMutation.mutate({ moduleId: mod.id, badgeName: mod.badge, badgeIcon: mod.badgeIcon }); }}
          onBack={() => setShowUnitQuiz(null)} />
      );
    }
  }

  if (activeLessonData && activeModuleData) {
    const mi = modules.findIndex(m => m.id === activeModule);
    return (
      <LearningPathModule lesson={activeLessonData} moduleName={activeModuleData.title}
        sectionColor={moduleColors[mi % moduleColors.length].hex}
        isCompleted={completedLessons.has(activeLessonData.id)}
        onComplete={() => {
          completeLessonMutation.mutate({ lessonId: activeLessonData.id, xp: activeLessonData.xp, moduleId: activeModuleData.id, badgeName: activeModuleData.badge });
        }}
        onBack={() => { setActiveLesson(null); setActiveModule(null); }}
        isPending={completeLessonMutation.isPending} />
    );
  }

  // Goal milestones between modules
  const goalMilestones = [
    { after: 0, icon: Target, label: "Goal: Understand Your Money", reward: "Money Master Badge" },
    { after: 1, icon: Trophy, label: "Goal: Bank Like a Pro", reward: "Savings Pro Badge" },
    { after: 2, icon: Zap, label: "Goal: Budget With Confidence", reward: "Budget Boss Badge" },
    { after: 3, icon: Shield, label: "Goal: Master Your Credit", reward: "Credit Pro Badge" },
    { after: 4, icon: TrendingUp, label: "Goal: Start Investing", reward: "Investor Badge" },
    { after: 5, icon: Crown, label: "Goal: Build Real Wealth", reward: "Wealth Builder Badge" },
    { after: 6, icon: GraduationCap, label: "FINAL GOAL: Financial Freedom", reward: "Independence Champion" },
  ];

  const totalModules = modules.length;
  const completedModules = modules.filter((m, i) => m.lessons.every(l => completedLessons.has(l.id)) && completedQuizzes.has(m.id)).length;

  return (
    <div className="space-y-6">
      {/* Header with overall goal progress */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black font-display">Your Learning Journey</h1>
        <p className="text-sm text-muted-foreground font-semibold">Complete each goal to unlock the next chapter</p>

        {/* Overall journey progress */}
        <div className="mt-3 glass rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold">Journey Progress</span>
            <span className="text-sm font-extrabold text-primary">{completedModules}/{totalModules} Goals</span>
          </div>
          <div className="flex gap-1.5">
            {modules.map((mod, i) => {
              const done = mod.lessons.every(l => completedLessons.has(l.id)) && completedQuizzes.has(mod.id);
              return (
                <motion.div
                  key={mod.id}
                  className={cn("h-3 flex-1 rounded-full", done ? moduleColors[i % moduleColors.length].bg : "bg-muted")}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  style={{ transformOrigin: "left" }}
                />
              );
            })}
          </div>
        </div>
      </motion.div>

      <DailyChallenge />

      {/* Skill Tree with Step Connectors & Goals */}
      <div className="flex flex-col items-center">
        {modules.map((mod, mi) => {
          const modLessons = mod.lessons;
          const completedCount = modLessons.filter(l => completedLessons.has(l.id)).length;
          const isModuleComplete = completedCount === modLessons.length;
          const isModuleUnlocked = mi === 0 || (modules[mi - 1].lessons.every(l => completedLessons.has(l.id)) && completedQuizzes.has(modules[mi - 1].id));
          const quizUnlocked = isUnitQuizUnlocked(mi);
          const quizCompleted = completedQuizzes.has(mod.id);
          const colors = moduleColors[mi % moduleColors.length];
          const ModIcon = moduleIcons[mi % moduleIcons.length];
          const currentLessonIdx = modLessons.findIndex(l => !completedLessons.has(l.id));
          const milestone = goalMilestones[mi];

          return (
            <motion.div key={mod.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: mi * 0.08 }} className="w-full max-w-sm">

              {/* Step connector between modules */}
              {mi > 0 && (
                <div className="flex flex-col items-center mb-4">
                  {/* Animated staircase steps between modules */}
                  {[0, 1, 2].map((stepIdx) => {
                    const prevDone = modules[mi - 1].lessons.every(l => completedLessons.has(l.id)) && completedQuizzes.has(modules[mi - 1].id);
                    return (
                      <motion.div
                        key={stepIdx}
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ delay: mi * 0.08 + stepIdx * 0.08, duration: 0.2 }}
                        className={cn(
                          "w-2 h-4 rounded-full my-0.5 transition-colors duration-500",
                          prevDone ? colors.bg : "bg-border"
                        )}
                        style={{ transformOrigin: "top" }}
                      />
                    );
                  })}

                  {/* Goal milestone card */}
                  {milestone && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: mi * 0.08 + 0.3, type: "spring" }}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-2xl border-2 my-2 w-full",
                        isModuleUnlocked
                          ? cn(colors.light, colors.border)
                          : "bg-muted/50 border-border opacity-60"
                      )}
                    >
                      <motion.div
                        animate={isModuleUnlocked && !isModuleComplete ? { scale: [1, 1.15, 1] } : {}}
                        transition={{ repeat: Infinity, duration: 2 }}
                      >
                        {(() => { const MIcon = milestone.icon; return <MIcon className={cn("w-7 h-7", isModuleUnlocked ? colors.text : "text-muted-foreground")} />; })()}
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm font-extrabold", isModuleUnlocked ? colors.text : "text-muted-foreground")}>
                          {milestone.label}
                        </p>
                        <p className="text-xs text-muted-foreground font-semibold">
                          Reward: {milestone.reward}
                        </p>
                      </div>
                      {isModuleComplete && quizCompleted && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          <CheckCircle2 className="w-6 h-6 text-primary" />
                        </motion.div>
                      )}
                    </motion.div>
                  )}

                  {/* Post-milestone steps */}
                  {[0, 1].map((stepIdx) => {
                    const prevDone = modules[mi - 1].lessons.every(l => completedLessons.has(l.id)) && completedQuizzes.has(modules[mi - 1].id);
                    return (
                      <motion.div
                        key={`post-${stepIdx}`}
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ delay: mi * 0.08 + 0.5 + stepIdx * 0.08, duration: 0.2 }}
                        className={cn(
                          "w-2 h-4 rounded-full my-0.5 transition-colors duration-500",
                          prevDone ? colors.bg : "bg-border"
                        )}
                        style={{ transformOrigin: "top" }}
                      />
                    );
                  })}
                </div>
              )}

              {/* First module goal (no steps before it) */}
              {mi === 0 && milestone && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-2xl border-2 mb-4 w-full",
                    colors.light, colors.border
                  )}
                >
                  <motion.div
                    animate={!isModuleComplete ? { scale: [1, 1.15, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    {(() => { const MIcon = milestone.icon; return <MIcon className={cn("w-7 h-7", colors.text)} />; })()}
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm font-extrabold", colors.text)}>{milestone.label}</p>
                    <p className="text-xs text-muted-foreground font-semibold">Reward: {milestone.reward}</p>
                  </div>
                  {isModuleComplete && quizCompleted && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400 }}>
                      <CheckCircle2 className="w-6 h-6 text-primary" />
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Module header */}
              <div className={cn("rounded-2xl p-4 mb-4 text-center border-2", isModuleUnlocked ? colors.border : "border-border opacity-50")}>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <ModIcon className={cn("w-6 h-6", isModuleUnlocked ? colors.text : "text-muted-foreground")} />
                  <h3 className={cn("font-black font-display text-lg", isModuleUnlocked ? colors.text : "text-muted-foreground")}>{mod.title}</h3>
                </div>
                <p className="text-xs text-muted-foreground font-semibold">{completedCount}/{modLessons.length} lessons{quizCompleted ? " · ✓ Certified" : ""}</p>
                <div className="h-2.5 rounded-full bg-muted overflow-hidden mt-2">
                  <motion.div className={cn("h-full rounded-full", colors.bg)}
                    initial={{ width: 0 }}
                    animate={{ width: `${((completedCount + (quizCompleted ? 1 : 0)) / (modLessons.length + 1)) * 100}%` }}
                    transition={{ duration: 0.8 }} />
                </div>
              </div>

              {/* Lesson nodes - winding path with step connectors */}
              <div className="flex flex-col items-center gap-0 mb-6">
                {modLessons.map((lesson, li) => {
                  const unlocked = isLessonUnlocked(mi, li);
                  const completed = completedLessons.has(lesson.id);
                  const isCurrent = unlocked && !completed && isModuleUnlocked;
                  const offset = li % 3 === 0 ? 0 : li % 3 === 1 ? 50 : -50;

                  return (
                    <div key={lesson.id} className="flex flex-col items-center" style={{ marginLeft: offset }}>
                      {/* Step connector — actual staircase steps */}
                      {li > 0 && (() => {
                        const prevOffset = (li - 1) % 3 === 0 ? 0 : (li - 1) % 3 === 1 ? 50 : -50;
                        const direction = offset - prevOffset; // positive = going right, negative = going left
                        const stepColor = completed || isCurrent ? colors.bg : "bg-border";
                        return (
                          <div className="flex flex-col items-center gap-0 -my-0.5">
                            {/* Vertical riser */}
                            <motion.div
                              initial={{ scaleY: 0 }}
                              animate={{ scaleY: 1 }}
                              transition={{ delay: mi * 0.05 + li * 0.06, duration: 0.2 }}
                              className={cn("w-1.5 h-3 rounded-full", stepColor)}
                              style={{ transformOrigin: "top" }}
                            />
                            {/* Horizontal tread */}
                            {direction !== 0 && (
                              <motion.div
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ delay: mi * 0.05 + li * 0.06 + 0.1, duration: 0.15 }}
                                className={cn("h-1.5 rounded-full", stepColor)}
                                style={{
                                  width: Math.abs(direction) * 0.6,
                                  transformOrigin: direction > 0 ? "left" : "right",
                                  marginLeft: direction > 0 ? 8 : -8,
                                }}
                              />
                            )}
                            {/* Vertical riser */}
                            <motion.div
                              initial={{ scaleY: 0 }}
                              animate={{ scaleY: 1 }}
                              transition={{ delay: mi * 0.05 + li * 0.06 + 0.2, duration: 0.2 }}
                              className={cn("w-1.5 h-3 rounded-full", stepColor)}
                              style={{ transformOrigin: "top" }}
                            />
                          </div>
                        );
                      })()}

                      {/* Node */}
                      <motion.button
                        onClick={() => { if (unlocked) { setActiveModule(mod.id); setActiveLesson(lesson.id); } }}
                        disabled={!unlocked}
                        whileTap={unlocked ? { scale: 0.95 } : {}}
                        className={cn(
                          "relative w-16 h-16 rounded-full flex items-center justify-center transition-all",
                          completed
                            ? cn(colors.bg, "text-primary-foreground shadow-lg")
                            : isCurrent
                              ? cn("bg-background border-[4px] shadow-lg cursor-pointer duo-pulse", colors.border)
                              : "bg-muted border-2 border-border text-muted-foreground cursor-not-allowed"
                        )}
                        style={completed ? { boxShadow: `0 4px 0 ${colors.hex}80` } : isCurrent ? { borderColor: colors.hex } : {}}
                      >
                        {completed ? (
                          <CheckCircle2 className="w-7 h-7" />
                        ) : isCurrent ? (
                          <ModIcon className="w-6 h-6" />
                        ) : (
                          <Lock className="w-5 h-5" />
                        )}

                        {unlocked && (
                          <span className={cn(
                            "absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center text-primary-foreground",
                            completed ? "bg-primary" : colors.bg
                          )}>{li + 1}</span>
                        )}
                      </motion.button>

                      <p className={cn("text-xs font-bold text-center mt-1.5 max-w-[110px] leading-tight",
                        completed ? colors.text : isCurrent ? "text-foreground" : "text-muted-foreground"
                      )}>{lesson.title}</p>
                    </div>
                  );
                })}

                {/* Quiz node with step connector */}
                <div className="flex flex-col items-center">
                  {/* Step connector to quiz */}
                  <div className="flex flex-col items-center gap-0 -my-0.5">
                    <motion.div initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
                      transition={{ delay: mi * 0.05 + modLessons.length * 0.06, duration: 0.2 }}
                      className={cn("w-1.5 h-3 rounded-full", quizCompleted ? "bg-duo-gold" : "bg-border")}
                      style={{ transformOrigin: "top" }} />
                    <motion.div initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
                      transition={{ delay: mi * 0.05 + modLessons.length * 0.06 + 0.15, duration: 0.2 }}
                      className={cn("w-1.5 h-3 rounded-full", quizCompleted ? "bg-duo-gold" : "bg-border")}
                      style={{ transformOrigin: "top" }} />
                  </div>
                  <motion.button
                    onClick={() => { if (quizUnlocked) setShowUnitQuiz(mod.id); }}
                    disabled={!quizUnlocked}
                    whileTap={quizUnlocked ? { scale: 0.95 } : {}}
                    className={cn(
                      "relative w-20 h-20 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all border-2",
                      quizCompleted
                        ? "bg-duo-gold text-primary-foreground border-duo-gold shadow-lg"
                        : quizUnlocked
                          ? "bg-background border-duo-gold text-duo-gold cursor-pointer duo-pulse shadow-md"
                          : "bg-muted border-border text-muted-foreground cursor-not-allowed"
                    )}
                    style={quizCompleted ? { boxShadow: "0 4px 0 hsl(45, 100%, 30%)" } : {}}
                  >
                    {quizCompleted ? <Trophy className="w-7 h-7" /> : quizUnlocked ? <Award className="w-7 h-7" /> : <Lock className="w-5 h-5" />}
                    <span className="text-[9px] font-black uppercase">Quiz</span>
                  </motion.button>
                  <p className="text-xs font-bold text-center mt-1.5">{quizCompleted ? "✓ Certified" : "Unit Quiz"}</p>
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Final celebration at bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col items-center mb-8"
        >
          {[0, 1, 2].map((i) => (
            <motion.div key={i} initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
              transition={{ delay: 0.9 + i * 0.08, duration: 0.2 }}
              className={cn("w-2 h-4 rounded-full my-0.5", completedModules === totalModules ? "bg-duo-gold" : "bg-border")}
              style={{ transformOrigin: "top" }}
            />
          ))}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1.2, type: "spring", stiffness: 200 }}
            className={cn(
              "w-24 h-24 rounded-full flex flex-col items-center justify-center border-4 mt-2",
              completedModules === totalModules
                ? "bg-duo-gold border-duo-gold text-primary-foreground shadow-xl"
                : "bg-muted border-border text-muted-foreground"
            )}
          >
            <span className="text-3xl">{completedModules === totalModules ? "🎓" : "🔒"}</span>
            <span className="text-[8px] font-black uppercase mt-0.5">
              {completedModules === totalModules ? "Complete!" : "Finish All"}
            </span>
          </motion.div>
          <p className="text-sm font-extrabold mt-2 text-center">
            {completedModules === totalModules ? "🎉 You've mastered financial literacy!" : "Financial Freedom Awaits"}
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LearningPath;
