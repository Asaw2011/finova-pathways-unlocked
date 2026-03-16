import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Flame, Zap, Award, Trophy, Lock, CheckCircle2, ChevronRight, Target, Heart, Diamond } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion } from "framer-motion";
import LearningPathModule from "@/components/learning-path/LearningPathModule";
import UnitQuiz from "@/components/learning-path/UnitQuiz";
import DailyChallenge from "@/components/learning-path/DailyChallenge";
import { useGameEconomy } from "@/contexts/GameEconomyContext";
import { Link } from "react-router-dom";

const sectionColors = [
  "hsl(142, 60%, 45%)",
  "hsl(210, 100%, 52%)",
  "hsl(280, 60%, 55%)",
  "hsl(38, 92%, 50%)",
  "hsl(340, 65%, 55%)",
  "hsl(172, 60%, 45%)",
  "hsl(200, 80%, 50%)",
  "hsl(260, 50%, 55%)",
];

const sectionBgColors = [
  "bg-emerald-50 border-emerald-200",
  "bg-blue-50 border-blue-200",
  "bg-purple-50 border-purple-200",
  "bg-amber-50 border-amber-200",
  "bg-pink-50 border-pink-200",
  "bg-teal-50 border-teal-200",
  "bg-sky-50 border-sky-200",
  "bg-violet-50 border-violet-200",
];

const sectionTextColors = [
  "text-emerald-600",
  "text-blue-600",
  "text-purple-600",
  "text-amber-600",
  "text-pink-600",
  "text-teal-600",
  "text-sky-600",
  "text-violet-600",
];

const sectionNodeBg = [
  "bg-emerald-500",
  "bg-blue-500",
  "bg-purple-500",
  "bg-amber-500",
  "bg-pink-500",
  "bg-teal-500",
  "bg-sky-500",
  "bg-violet-500",
];

const sectionNodeBgLight = [
  "bg-emerald-100",
  "bg-blue-100",
  "bg-purple-100",
  "bg-amber-100",
  "bg-pink-100",
  "bg-teal-100",
  "bg-sky-100",
  "bg-violet-100",
];

export const modules = [
  {
    id: "money-basics",
    title: "Money Basics",
    badge: "Money Master",
    badgeIcon: "wallet",
    lessons: [
      {
        id: "mb-1", title: "What Is Money?", xp: 10,
        videoId: "YCN2aTlocOw",
        content: "Money is a tool that helps us exchange value. It comes in many forms: cash, digital payments, and even cryptocurrency. Understanding money starts with knowing it's simply a medium of exchange — a way to trade your time and skills for goods and services.",
        takeaway: "Money is a tool for exchanging value, not just paper in your wallet.",
        quote: { text: "Money is only a tool. It will take you wherever you wish, but it will not replace you as the driver.", author: "Ayn Rand" },
        example: "When you babysit for $15/hour, you're trading your time for money. When you buy lunch for $10, you're trading money for food. Money makes these exchanges simple.",
        quiz: [
          { q: "What is the primary purpose of money?", options: ["To make you rich", "Medium of exchange", "A government control tool", "To collect in a bank"], answer: 1 },
          { q: "Which is NOT a form of money?", options: ["Cash", "Digital payment", "Credit score", "Cryptocurrency"], answer: 2 },
        ],
      },
      {
        id: "mb-2", title: "Where Your Money Goes", xp: 10,
        content: "Most people think they have a spending problem. In reality, they have a tracking problem. Money disappears through small purchases: food, online shopping, subscriptions, entertainment. Tracking spending for just 30 days can reveal patterns.",
        takeaway: "Awareness is the first step to financial control.",
        quote: { text: "Do not save what is left after spending, but spend what is left after saving.", author: "Warren Buffett" },
        example: "If you spend $5 on coffee every weekday, that's $100/month or $1,200/year — enough for a weekend trip.",
        quiz: [
          { q: "What's the FIRST step to controlling your finances?", options: ["Investing in stocks", "Tracking your spending", "Getting a credit card", "Opening a savings account"], answer: 1 },
          { q: "Which of these is NOT a common money leak?", options: ["Subscriptions", "Coffee runs", "Emergency savings", "Impulse purchases"], answer: 2 },
        ],
      },
      {
        id: "mb-3", title: "Budgeting Made Simple", xp: 10,
        videoId: "HQzoZfc3GwQ",
        content: "A budget is not about restriction — it's about planning your money before you spend it. The 50/30/20 rule divides your income: 50% for needs, 30% for wants, and 20% for savings.",
        takeaway: "Pay yourself first by saving before spending.",
        quote: { text: "A budget is telling your money where to go instead of wondering where it went.", author: "Dave Ramsey" },
        example: "Using the 50/30/20 rule on a $2,000 paycheck: $1,000 for needs, $600 for wants, $400 for savings.",
        quiz: [
          { q: "What is the 50/30/20 rule?", options: ["Save 50%, spend 30%, invest 20%", "Needs 50%, wants 30%, savings 20%", "Taxes 50%, rent 30%, food 20%", "Invest 50%, save 30%, spend 20%"], answer: 1 },
          { q: "What does 'pay yourself first' mean?", options: ["Buy yourself a gift", "Save before spending", "Take a salary advance", "Pay your own bills first"], answer: 1 },
        ],
      },
      {
        id: "mb-4", title: "Needs vs Wants", xp: 10,
        content: "Needs are things required to live: food, housing, medicine, transportation. Wants improve your life but are optional: new sneakers, streaming services, gaming upgrades. Smart money decisions come from knowing the difference.",
        takeaway: "Distinguishing needs from wants is essential for smart spending.",
        quote: { text: "Too many people spend money they earned to buy things they don't want to impress people they don't like.", author: "Will Rogers" },
        example: "Your phone is a need for communication. The latest $1,200 model when your current phone works fine? That's a want.",
        quiz: [
          { q: "Which is a NEED?", options: ["Netflix subscription", "New gaming console", "Groceries", "Designer shoes"], answer: 2 },
          { q: "Which is a WANT?", options: ["Rent", "Medicine", "Transportation to work", "Latest smartphone"], answer: 3 },
        ],
      },
      {
        id: "mb-5", title: "Emergency Funds", xp: 10,
        content: "An emergency fund protects you from unexpected expenses: car repair, medical costs, laptop replacement. Recommended starting goal: $500–$1,000. Start small — even $25/month adds up.",
        takeaway: "Savings create financial security.",
        quote: { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
        example: "Without an emergency fund, a $600 car repair could mean credit card debt at 24% interest — costing you $744 total.",
        quiz: [
          { q: "What's a good starting emergency fund goal?", options: ["$50", "$500–$1,000", "$10,000", "$100,000"], answer: 1 },
          { q: "Which is an emergency expense?", options: ["Concert tickets", "New shoes", "Car breakdown repair", "Vacation"], answer: 2 },
        ],
      },
      {
        id: "mb-6", title: "Setting Financial Goals", xp: 10,
        content: "Goals give your money purpose. Short-term goals (1-12 months): save for headphones, a trip. Medium-term (1-5 years): car, college fund. Long-term (5+ years): house, retirement. Write them down — you're 42% more likely to achieve written goals.",
        takeaway: "A goal without a plan is just a wish.",
        quote: { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
        example: "Goal: Save $600 for a new phone in 6 months = $100/month or $25/week. That's skipping 2-3 takeout meals per week.",
        quiz: [
          { q: "A short-term financial goal is typically:", options: ["10+ years", "1-12 months", "30 years", "A lifetime"], answer: 1 },
          { q: "Writing goals down makes you:", options: ["Less motivated", "42% more likely to achieve them", "No difference", "Stressed out"], answer: 1 },
        ],
      },
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
    id: "banking-saving",
    title: "Banking & Saving",
    badge: "Savings Pro",
    badgeIcon: "piggy-bank",
    lessons: [
      {
        id: "bs-1", title: "Types of Bank Accounts", xp: 10,
        videoId: "1m6s2FnhECk",
        content: "Banks offer different accounts for different purposes. Checking accounts are for daily spending — you can use a debit card, write checks, and make transfers. Savings accounts are for money you want to keep and grow with interest.",
        takeaway: "Use checking for spending, savings for growing your money.",
        quote: { text: "The habit of saving is itself an education.", author: "T.T. Munger" },
        example: "Keep $500 in checking for daily use, and $2,000 in a high-yield savings account earning 4.5% APY — that's $90/year in free money.",
        quiz: [
          { q: "A checking account is best for:", options: ["Long-term saving", "Daily spending", "Investing", "Retirement"], answer: 1 },
          { q: "Savings accounts typically offer:", options: ["No interest", "Interest on your balance", "Free stocks", "Credit cards"], answer: 1 },
        ],
      },
      {
        id: "bs-2", title: "How Interest Works", xp: 10,
        content: "Interest is the price of using money. When you save, the bank pays YOU interest. When you borrow, YOU pay the bank interest. APY (Annual Percentage Yield) shows how much your savings grow per year.",
        takeaway: "Interest can work for you (savings) or against you (debt).",
        quote: { text: "Compound interest is the eighth wonder of the world.", author: "Albert Einstein" },
        example: "$1,000 in a savings account at 4.5% APY earns $45 in the first year. In 10 years with compounding, it becomes $1,553.",
        quiz: [
          { q: "APY stands for:", options: ["Annual Payment Yield", "Annual Percentage Yield", "Account Profit Year", "Average Pay Yearly"], answer: 1 },
          { q: "When you have a savings account, interest works:", options: ["Against you", "For you", "Not at all", "Only on weekdays"], answer: 1 },
        ],
      },
      {
        id: "bs-3", title: "Online vs Traditional Banks", xp: 10,
        content: "Online banks often offer higher interest rates because they don't pay for physical branches. Traditional banks offer in-person service. Many people use both: online for savings (higher rates) and traditional for checking (ATM access).",
        takeaway: "Online banks often offer better rates; use both strategically.",
        quote: { text: "Do not put all your eggs in one basket.", author: "Andrew Carnegie" },
        example: "Traditional bank savings: 0.01% APY. Online bank savings: 4.5% APY. On $5,000, that's $0.50 vs $225 per year.",
        quiz: [
          { q: "Online banks typically offer:", options: ["Lower interest rates", "Higher interest rates", "No accounts", "Physical branches"], answer: 1 },
          { q: "A smart strategy is to:", options: ["Use only one bank", "Use online for savings, traditional for checking", "Avoid banks entirely", "Keep cash at home"], answer: 1 },
        ],
      },
      {
        id: "bs-4", title: "Protecting Your Money", xp: 10,
        videoId: "aLQCVfbMB0Y",
        content: "FDIC insurance protects your bank deposits up to $250,000. Never share your PIN or banking passwords. Use strong unique passwords and enable two-factor authentication. Watch for phishing emails pretending to be your bank.",
        takeaway: "Your money is protected, but you must protect your accounts.",
        quote: { text: "It takes 20 years to build a reputation and five minutes to ruin it.", author: "Warren Buffett" },
        example: "If your bank fails, FDIC insurance ensures you get back every dollar up to $250,000. But if someone steals your PIN, that protection doesn't help.",
        quiz: [
          { q: "FDIC insures deposits up to:", options: ["$100,000", "$250,000", "$500,000", "$1,000,000"], answer: 1 },
          { q: "To protect your accounts, you should:", options: ["Share passwords with friends", "Use the same password everywhere", "Enable two-factor authentication", "Write PIN on your card"], answer: 2 },
        ],
      },
      {
        id: "bs-5", title: "Saving Strategies That Work", xp: 10,
        content: "Automate savings by setting up automatic transfers on payday. Use the 'round-up' method where purchases are rounded up and the difference is saved. Try no-spend challenges for a week to boost savings quickly.",
        takeaway: "Automation removes willpower from saving — make it effortless.",
        quote: { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
        example: "Automating $50/week in savings means $2,600/year without thinking about it. Round-ups on 5 daily purchases of $3.40 save an extra $3/day = $1,095/year.",
        quiz: [
          { q: "The best way to save consistently is:", options: ["Remember to transfer manually", "Automate savings", "Save whatever's left", "Wait for a bonus"], answer: 1 },
          { q: "Round-up savings works by:", options: ["Rounding down purchases", "Saving the difference to the next dollar", "Doubling your purchase", "Skipping purchases"], answer: 1 },
        ],
      },
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
    id: "budgeting-spending",
    title: "Budgeting & Spending",
    badge: "Budget Boss",
    badgeIcon: "calculator",
    lessons: [
      {
        id: "bsp-1", title: "Creating Your First Budget", xp: 10,
        videoId: "sVKQn2I4HDM",
        content: "Start by listing your income sources. Then list all expenses: fixed (rent, phone bill) and variable (food, entertainment). Subtract expenses from income. If negative, cut wants first. Track for 30 days to see real patterns.",
        takeaway: "A budget is a plan for every dollar you earn.",
        quote: { text: "Beware of little expenses; a small leak will sink a great ship.", author: "Benjamin Franklin" },
        example: "Income: $1,500. Fixed expenses: $800. Variable expenses: $500. That leaves $200 for savings — but only if you track it.",
        quiz: [
          { q: "The first step in budgeting is:", options: ["Cutting all spending", "Listing your income", "Opening a credit card", "Investing"], answer: 1 },
          { q: "If expenses exceed income, you should:", options: ["Borrow more", "Cut wants first", "Ignore it", "Increase fixed expenses"], answer: 1 },
        ],
      },
      {
        id: "bsp-2", title: "Fixed vs Variable Expenses", xp: 10,
        content: "Fixed expenses stay the same each month: rent, car payment, insurance, phone bill. Variable expenses change: groceries, gas, entertainment, dining out. Fixed expenses are harder to reduce quickly, so start cutting variable expenses first.",
        takeaway: "Know which expenses you can control — and start there.",
        quote: { text: "It's not your salary that makes you rich, it's your spending habits.", author: "Charles A. Jaffe" },
        example: "Fixed: Rent $800 + Phone $60 + Insurance $100 = $960. Variable: Groceries $300 + Dining $200 + Fun $150 = $650. Cut dining by half to save $100/month.",
        quiz: [
          { q: "Which is a fixed expense?", options: ["Groceries", "Dining out", "Rent", "Entertainment"], answer: 2 },
          { q: "To save money quickly, start by cutting:", options: ["Fixed expenses", "Variable expenses", "All expenses", "Income"], answer: 1 },
        ],
      },
      {
        id: "bsp-3", title: "The Impulse Purchase Trap", xp: 10,
        content: "Impulse purchases are unplanned buys driven by emotion. The 24-hour rule: wait a day before buying anything non-essential over $20. Ask yourself: 'Do I need this, or do I just want it right now?' Most impulse purchases feel unnecessary after waiting.",
        takeaway: "Sleep on it before you spend it.",
        quote: { text: "Wealth consists not in having great possessions, but in having few wants.", author: "Epictetus" },
        example: "The average American spends $5,400/year on impulse purchases. The 24-hour rule could save thousands.",
        quiz: [
          { q: "The 24-hour rule suggests:", options: ["Buy immediately", "Wait before non-essential purchases", "Only shop online", "Never buy anything"], answer: 1 },
          { q: "Impulse purchases are driven by:", options: ["Careful planning", "Emotion", "Budgets", "Savings goals"], answer: 1 },
        ],
      },
      {
        id: "bsp-4", title: "Subscription Awareness", xp: 10,
        videoId: "jHXfDc0YKfk",
        content: "Small monthly subscriptions add up fast. $10 + $15 + $11 + $17 + $5 = $58/month = $696/year. Audit your subscriptions quarterly. Cancel what you don't actively use. Share family plans to split costs.",
        takeaway: "Small subscriptions can quietly drain your money.",
        quote: { text: "Beware of little expenses; a small leak will sink a great ship.", author: "Benjamin Franklin" },
        example: "The average person has 12 subscriptions totaling $219/month — but actively uses only 4 of them.",
        quiz: [
          { q: "$15/month in subscriptions costs per year:", options: ["$150", "$180", "$120", "$200"], answer: 1 },
          { q: "How often should you review subscriptions?", options: ["Never", "Every few months", "Once a decade", "Only when broke"], answer: 1 },
        ],
      },
      {
        id: "bsp-5", title: "Smart Shopping Strategies", xp: 10,
        content: "Never buy the first option you see. Compare prices across at least 3 sources. Use price tracking tools and wait for sales on non-urgent items. Buy generic brands for basics — same quality, lower price. Use cashback apps for everyday purchases.",
        takeaway: "A few minutes of research can save you hundreds.",
        quote: { text: "Price is what you pay. Value is what you get.", author: "Warren Buffett" },
        example: "Comparing prices on a $300 laptop across 3 stores could easily save $40-80. Using cashback apps on groceries saves $5-15 per trip.",
        quiz: [
          { q: "Before buying, you should:", options: ["Buy the first option", "Compare at least 3 sources", "Always buy the cheapest", "Only buy brand names"], answer: 1 },
          { q: "Generic brands are often:", options: ["Lower quality", "Same quality, lower price", "More expensive", "Not available"], answer: 1 },
        ],
      },
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
    id: "credit-debt",
    title: "Credit & Debt",
    badge: "Credit Pro",
    badgeIcon: "credit-card",
    lessons: [
      {
        id: "cd-1", title: "What Is Credit?", xp: 10,
        videoId: "jPLUsc5SWTE",
        content: "Credit is borrowed money that you promise to pay back. It's a trust system: lenders give you money now, and you repay later (usually with interest). Building good credit early opens doors for apartments, car loans, and lower insurance rates.",
        takeaway: "Credit is borrowed trust — build it wisely.",
        quote: { text: "Good credit is a financial superpower.", author: "Morgan Housel" },
        example: "A good credit score can save you $50,000+ in interest over a 30-year mortgage compared to a poor score.",
        quiz: [
          { q: "Credit is essentially:", options: ["Free money", "Borrowed money you repay", "A gift from banks", "Your salary"], answer: 1 },
          { q: "Building good credit helps you:", options: ["Avoid all debt", "Get better loan rates", "Never pay bills", "Skip rent payments"], answer: 1 },
        ],
      },
      {
        id: "cd-2", title: "Credit Scores Explained", xp: 10,
        content: "A credit score ranges from 300–850 and measures your creditworthiness. Five factors: Payment history (35%), amounts owed (30%), length of credit history (15%), new credit (10%), credit mix (10%). Higher scores = better rates and opportunities.",
        takeaway: "Your credit score follows you for life — build it early.",
        quote: { text: "The borrower is slave to the lender.", author: "Proverbs 22:7" },
        example: "A 750 credit score could save you $50,000 in interest over a 30-year mortgage compared to a 620 score.",
        quiz: [
          { q: "Credit score range is:", options: ["0–500", "100–850", "300–850", "500–1000"], answer: 2 },
          { q: "The biggest factor in your credit score is:", options: ["Length of history", "Payment history", "Credit mix", "New credit"], answer: 1 },
        ],
      },
      {
        id: "cd-3", title: "Debit vs Credit Cards", xp: 10,
        content: "Debit cards use money from your bank account instantly. Credit cards borrow money from a lender that you repay later. Debit = spend what you have. Credit = borrow then repay. Credit cards can build credit when used responsibly — always pay the full balance.",
        takeaway: "Know the difference to avoid overspending.",
        quote: { text: "Compound interest is the eighth wonder of the world. He who understands it, earns it; he who doesn't, pays it.", author: "Albert Einstein" },
        example: "Using a debit card for a $50 purchase immediately takes $50 from your account. A credit card lets you pay next month — but charges ~20% interest if you don't.",
        quiz: [
          { q: "Debit cards pull money from:", options: ["A loan", "Your bank account", "Your credit score", "Future earnings"], answer: 1 },
          { q: "To avoid credit card interest:", options: ["Pay minimum only", "Pay full balance monthly", "Close the card", "Ignore statements"], answer: 1 },
        ],
      },
      {
        id: "cd-4", title: "How Interest Charges Work", xp: 10,
        videoId: "EJMEMaMtRto",
        content: "APR (Annual Percentage Rate) is the yearly interest rate on borrowed money. Credit card APRs average 20-25%. If you carry a $1,000 balance at 24% APR and pay only minimums, it takes 5+ years to pay off and costs $600+ in interest alone.",
        takeaway: "Pay in full each month to avoid interest charges.",
        quote: { text: "Beware of little expenses; a small leak will sink a great ship.", author: "Benjamin Franklin" },
        example: "A $1,000 balance at 24% APR with $25 minimum payments takes 62 months and costs $547 in interest. Paying $100/month costs only $105 in interest.",
        quiz: [
          { q: "APR stands for:", options: ["Annual Payment Rate", "Annual Percentage Rate", "Average Payment Required", "Automatic Payment Refund"], answer: 1 },
          { q: "To minimize interest on credit cards:", options: ["Pay minimums only", "Pay the full balance", "Open more cards", "Skip payments"], answer: 1 },
        ],
      },
      {
        id: "cd-5", title: "Avoiding Debt Traps", xp: 10,
        content: "Debt becomes dangerous when interest compounds, minimum payments are ignored, and spending exceeds income. Watch out for payday loans (400%+ APR), 'buy now pay later' traps, and car title loans. If it sounds too easy, it's probably a trap.",
        takeaway: "If borrowing seems too easy, it's probably too expensive.",
        quote: { text: "The only man who sticks closer to you in adversity than a friend is a creditor.", author: "Unknown" },
        example: "A $400 payday loan can cost $460 in just two weeks — that's an APR of over 400%. A credit card at 24% would cost the same $400 about $8 in interest over two weeks.",
        quiz: [
          { q: "Which is a debt trap?", options: ["Paying full balance", "Payday loans", "Emergency savings", "Low-interest student loans"], answer: 1 },
          { q: "Minimum payments mostly cover:", options: ["The principal", "Interest charges", "Future purchases", "Insurance fees"], answer: 1 },
        ],
      },
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
    id: "investing-fundamentals",
    title: "Investing Fundamentals",
    badge: "Investing Starter",
    badgeIcon: "trending-up",
    lessons: [
      {
        id: "if-1", title: "Why Invest?", xp: 10,
        videoId: "gFQNPmLKj1k",
        content: "Investing means putting money into assets that can grow over time. While saving protects money, investing grows it. Historically, the stock market returns ~7-10% per year on average. Investing beats inflation and builds long-term wealth.",
        takeaway: "Investing grows your money; saving just protects it.",
        quote: { text: "The stock market is a device for transferring money from the impatient to the patient.", author: "Warren Buffett" },
        example: "$5,000 in a savings account at 0.5% earns $25/year. The same $5,000 invested at 7% average returns earns $350/year — 14x more.",
        quiz: [
          { q: "Investing is best for:", options: ["Next week's expenses", "Long-term wealth building", "Emergency funds", "Daily spending"], answer: 1 },
          { q: "The stock market historically returns:", options: ["1-2% per year", "7-10% per year", "50% per year", "0%"], answer: 1 },
        ],
      },
      {
        id: "if-2", title: "Stocks 101", xp: 10,
        content: "A stock represents ownership in a company. When a company grows and profits increase, its stock price usually rises. You can buy stocks through brokerage accounts. Even $1 can get you started with fractional shares.",
        takeaway: "Owning stock means owning a piece of a company.",
        quote: { text: "In the short run, the market is a voting machine, but in the long run, it is a weighing machine.", author: "Benjamin Graham" },
        example: "If you bought $1,000 of Apple stock in 2010, it would be worth over $15,000 today. That's the power of picking good companies and being patient.",
        quiz: [
          { q: "A stock represents:", options: ["A loan to a company", "Ownership in a company", "A government bond", "A savings account"], answer: 1 },
          { q: "Fractional shares let you:", options: ["Buy part of a stock for less money", "Get free stocks", "Avoid all risk", "Skip market hours"], answer: 0 },
        ],
      },
      {
        id: "if-3", title: "Bonds & Fixed Income", xp: 10,
        content: "Bonds are loans you make to governments or companies. They pay you back with interest over a set period. Bonds are generally safer than stocks but offer lower returns. They're great for balancing a portfolio and reducing risk.",
        takeaway: "Bonds are the stable, predictable part of your investment portfolio.",
        quote: { text: "The four most dangerous words in investing are: 'This time it's different.'", author: "Sir John Templeton" },
        example: "A $1,000 government bond at 3% pays you $30/year in interest for 10 years, then returns your $1,000. Predictable and safe.",
        quiz: [
          { q: "Bonds are essentially:", options: ["Ownership in a company", "Loans you make to others", "Savings accounts", "Insurance policies"], answer: 1 },
          { q: "Compared to stocks, bonds are:", options: ["Higher risk, higher return", "Lower risk, lower return", "No risk, no return", "Exactly the same"], answer: 1 },
        ],
      },
      {
        id: "if-4", title: "ETFs & Index Funds", xp: 10,
        videoId: "OwpFBi-jRVg",
        content: "ETFs (Exchange Traded Funds) bundle many stocks together. An S&P 500 ETF gives you exposure to 500 of America's largest companies. Benefits: instant diversification, low fees, easy to buy. Most financial experts recommend index funds for beginners.",
        takeaway: "ETFs let you invest in many companies at once — simple and effective.",
        quote: { text: "Don't look for the needle in the haystack. Just buy the haystack!", author: "John Bogle" },
        example: "An S&P 500 ETF gives you exposure to Apple, Microsoft, Google, Amazon, and 496 other companies for as little as $1.",
        quiz: [
          { q: "ETF stands for:", options: ["Electronic Transfer Fund", "Exchange-Traded Fund", "Extra Tax Filing", "Emergency Trust Fund"], answer: 1 },
          { q: "Index funds are recommended for beginners because:", options: ["They guarantee profits", "They provide diversification with low fees", "They're free", "They never lose value"], answer: 1 },
        ],
      },
      {
        id: "if-5", title: "The Power of Compound Growth", xp: 10,
        videoId: "wf91rEGw88Q",
        content: "Compound growth means your returns earn returns. Invest $100/month starting at 18 with 7% growth → ~$400k by age 60. Starting at 28 → only ~$230k. Starting at 35 → only ~$120k. Time is the single most powerful factor.",
        takeaway: "Time is the most powerful tool in investing — start now.",
        quote: { text: "Compound interest is the eighth wonder of the world.", author: "Albert Einstein" },
        example: "Starting at 18 vs 28 with $100/month at 7%: $400K vs $230K by age 60 — a $170K difference from just 10 years of waiting.",
        quiz: [
          { q: "Compound growth earns returns on:", options: ["Only the original amount", "Interest + principal", "Just the interest", "Nothing"], answer: 1 },
          { q: "Starting to invest earlier means:", options: ["Less total growth", "More time for compounding", "Higher risk", "Lower returns"], answer: 1 },
        ],
      },
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
    id: "building-wealth",
    title: "Building Wealth",
    badge: "Wealth Builder",
    badgeIcon: "gem",
    lessons: [
      {
        id: "bw-1", title: "Income vs Wealth", xp: 10,
        content: "Income is money you earn; wealth is money you keep and grow. High income doesn't guarantee wealth — many high earners live paycheck to paycheck. Wealth = assets minus liabilities. Building wealth requires spending less than you earn and investing the difference.",
        takeaway: "It's not what you earn, it's what you keep.",
        quote: { text: "Wealth is not about having a lot of money; it's about having a lot of options.", author: "Chris Rock" },
        example: "A person earning $50K who saves $10K/year builds more wealth than someone earning $150K who spends it all. After 20 years at 7% returns: $410K vs $0.",
        quiz: [
          { q: "Wealth is measured by:", options: ["Your salary", "Assets minus liabilities", "Your job title", "How much you spend"], answer: 1 },
          { q: "High income guarantees wealth:", options: ["Always true", "Sometimes true", "False — spending matters more", "Only for millionaires"], answer: 2 },
        ],
      },
      {
        id: "bw-2", title: "Multiple Income Streams", xp: 10,
        videoId: "hv9dGWOG3bk",
        content: "Relying on one income source is risky. Types of income: active (job/freelancing), passive (investments, rentals), portfolio (dividends, capital gains). Side hustles, freelancing, and investments create financial resilience.",
        takeaway: "Don't put all your eggs in one basket — diversify income.",
        quote: { text: "Never depend on a single income. Make investment to create a second source.", author: "Warren Buffett" },
        example: "$200/month side income invested at 7% for 20 years grows to over $100,000. That's a significant nest egg from a modest side hustle.",
        quiz: [
          { q: "Multiple income streams provide:", options: ["More stress", "Financial resilience", "Tax problems always", "Less free time always"], answer: 1 },
          { q: "Passive income comes from:", options: ["Active work only", "Investments and assets", "Borrowing money", "Government aid"], answer: 1 },
        ],
      },
      {
        id: "bw-3", title: "The Millionaire Mindset", xp: 10,
        content: "Research shows most millionaires are first-generation wealthy — they built it themselves. Common traits: live below means, avoid lifestyle inflation, invest consistently, think long-term, continuous learning. The average millionaire takes 28 years to reach that milestone.",
        takeaway: "Wealth is built through discipline, not luck.",
        quote: { text: "Someone's sitting in the shade today because someone planted a tree a long time ago.", author: "Warren Buffett" },
        example: "The average millionaire drives a 4-year-old car, lives in a modest home, and invests 15-20% of income. It's not about flashy spending.",
        quiz: [
          { q: "Most millionaires build wealth through:", options: ["Lottery winnings", "Discipline over decades", "Inheritance only", "Day trading"], answer: 1 },
          { q: "Lifestyle inflation means:", options: ["Saving more as you earn more", "Spending more as you earn more", "Investing all raises", "Reducing expenses"], answer: 1 },
        ],
      },
      {
        id: "bw-4", title: "Avoiding Lifestyle Inflation", xp: 10,
        content: "When your income rises, resist the urge to upgrade everything. A raise doesn't mean a new car. Instead: save 50% of every raise, keep your current lifestyle, invest the difference. Lifestyle inflation is the #1 wealth killer for high earners.",
        takeaway: "Save your raises — live on your old salary, invest the new money.",
        quote: { text: "It's not your salary that makes you rich, it's your spending habits.", author: "Charles A. Jaffe" },
        example: "Getting a $5,000 raise? If you save $2,500 of it and invest at 7% for 20 years, that single raise becomes $102,000 in wealth.",
        quiz: [
          { q: "When you get a raise, you should:", options: ["Upgrade your car immediately", "Save at least 50% of the increase", "Spend it all as a reward", "Quit your job"], answer: 1 },
          { q: "Lifestyle inflation is:", options: ["Good for building wealth", "The #1 wealth killer for earners", "Unavoidable", "Only for rich people"], answer: 1 },
        ],
      },
      {
        id: "bw-5", title: "Net Worth Tracking", xp: 10,
        content: "Net worth = assets (savings, investments, property) minus liabilities (debts, loans). Track it monthly. Even a negative net worth (student loans) is fine — the trend matters more than the number. Growing net worth = building wealth.",
        takeaway: "What gets measured gets managed — track your net worth.",
        quote: { text: "You can't manage what you don't measure.", author: "Peter Drucker" },
        example: "Age 22: Savings $2,000 - Student Loans $15,000 = Net Worth -$13,000. Age 25: Savings $10,000 + Investments $5,000 - Loans $8,000 = Net Worth $7,000. The trend is what matters!",
        quiz: [
          { q: "Net worth equals:", options: ["Income minus expenses", "Assets minus liabilities", "Salary times years worked", "Total savings only"], answer: 1 },
          { q: "A negative net worth means:", options: ["You're a failure", "You should give up", "Your liabilities exceed assets — focus on the trend", "You can never build wealth"], answer: 2 },
        ],
      },
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
    id: "risk-decisions",
    title: "Risk & Financial Decisions",
    badge: "Risk Navigator",
    badgeIcon: "shield",
    lessons: [
      {
        id: "rd-1", title: "Understanding Risk", xp: 10,
        content: "All investments carry risk — the chance of losing money. Higher potential returns usually mean higher risk. Your risk tolerance depends on your age, goals, and personality. Young investors can afford more risk because they have time to recover from losses.",
        takeaway: "Risk and reward are connected — understand your tolerance.",
        quote: { text: "Risk comes from not knowing what you're doing.", author: "Warren Buffett" },
        example: "Stocks might drop 30% in a crash but historically recover within 2-5 years. If you're 20, you have 40+ years — plenty of time to ride out volatility.",
        quiz: [
          { q: "Higher returns usually mean:", options: ["Zero risk", "Higher risk", "Guaranteed profits", "Lower risk"], answer: 1 },
          { q: "Young investors can take more risk because:", options: ["They're reckless", "They have time to recover", "They don't care about money", "They know more"], answer: 1 },
        ],
      },
      {
        id: "rd-2", title: "Diversification", xp: 10,
        videoId: "ZCFkWDdmXG8",
        content: "Diversification means spreading money across different investments. Don't put all your money in one stock, one industry, or one country. A diversified portfolio might include stocks, bonds, real estate, and international investments.",
        takeaway: "Diversification is the only free lunch in investing.",
        quote: { text: "Wide diversification is only required when investors do not understand what they are doing.", author: "Warren Buffett" },
        example: "If 100% of your money is in one tech stock and it drops 60%, you lose 60%. If it's split across 500 companies (ETF), a single company's drop barely affects you.",
        quiz: [
          { q: "Diversification means:", options: ["Buying one stock", "Spreading investments across many assets", "Avoiding investing", "Only buying bonds"], answer: 1 },
          { q: "A diversified portfolio reduces:", options: ["All risk", "Unsystematic risk", "Returns to zero", "The need to invest"], answer: 1 },
        ],
      },
      {
        id: "rd-3", title: "Scams & Financial Fraud", xp: 10,
        content: "If it sounds too good to be true, it probably is. Red flags: guaranteed high returns, pressure to act now, unsolicited offers, requests for personal info. Common scams: Ponzi schemes, phishing, fake crypto projects, advance-fee fraud.",
        takeaway: "Skepticism is your best financial defense.",
        quote: { text: "There are no shortcuts to any place worth going.", author: "Beverly Sills" },
        example: "'Invest $100, guaranteed $1,000 return in a week!' — That's a 900% weekly return. Even Warren Buffett averages 20% per year. It's a scam.",
        quiz: [
          { q: "A major red flag for scams is:", options: ["Moderate returns", "Guaranteed high returns", "Long time horizons", "Diversification"], answer: 1 },
          { q: "Ponzi schemes pay returns using:", options: ["Legitimate profits", "New investors' money", "Bank interest", "Government funds"], answer: 1 },
        ],
      },
      {
        id: "rd-4", title: "Insurance Basics", xp: 10,
        content: "Insurance protects against financial catastrophe. Types: health (medical bills), auto (car accidents), renter's (belongings), life (family protection). A monthly premium is a small price to avoid a massive unexpected cost.",
        takeaway: "Insurance is paying a small amount to protect against catastrophic loss.",
        quote: { text: "The question is not whether we can afford to invest in every child; it is whether we can afford not to.", author: "Marian Wright Edelman" },
        example: "Renter's insurance costs ~$15/month. Without it, if your apartment floods and destroys $5,000 of belongings, you pay it all yourself.",
        quiz: [
          { q: "Insurance protects against:", options: ["Small daily expenses", "Catastrophic financial loss", "Earning less money", "Paying taxes"], answer: 1 },
          { q: "A premium is:", options: ["A reward", "The monthly payment for insurance", "A type of investment", "A bank fee"], answer: 1 },
        ],
      },
      {
        id: "rd-5", title: "Making Big Financial Decisions", xp: 10,
        content: "Big decisions (car, college, apartment) need research and math, not emotion. Compare total costs, not monthly payments. Consider opportunity cost: money spent on X can't be invested. Sleep on big decisions for at least 48 hours.",
        takeaway: "Use math, not emotions, for big financial choices.",
        quote: { text: "The biggest risk is not taking any risk.", author: "Mark Zuckerberg" },
        example: "A $25,000 car at 6% for 5 years costs $28,999 total. A $15,000 car at the same rate costs $17,399. The $10K saved, invested at 7% for 30 years, becomes $76,000.",
        quiz: [
          { q: "For big purchases, compare:", options: ["Monthly payments only", "Total cost over time", "Brand names only", "What friends bought"], answer: 1 },
          { q: "Opportunity cost means:", options: ["The price of opportunities", "Money spent here can't grow elsewhere", "Only buying on sale", "Getting the best deal"], answer: 1 },
        ],
      },
    ],
    unitQuiz: [
      { q: "Diversification reduces:", options: ["All possible risk", "Unsystematic risk", "Your total returns to zero", "Your need to save"], answer: 1 },
      { q: "A red flag for financial scams is:", options: ["Moderate projected returns", "Guaranteed high returns", "SEC registration", "Transparent fees"], answer: 1 },
      { q: "Insurance premiums are:", options: ["Investment returns", "Monthly payments for protection", "Bank penalties", "Tax refunds"], answer: 1 },
      { q: "Opportunity cost means:", options: ["Free money", "Money spent can't be invested elsewhere", "The cheapest option", "A type of interest"], answer: 1 },
      { q: "Young investors can take more risk because:", options: ["They know more", "They have time to recover", "Risk doesn't affect them", "They have more money"], answer: 1 },
    ],
  },
  {
    id: "financial-independence",
    title: "Financial Independence",
    badge: "Independence Champion",
    badgeIcon: "crown",
    lessons: [
      {
        id: "fi-1", title: "What Is Financial Independence?", xp: 10,
        videoId: "bfAzi6D5FpM",
        content: "Financial independence means having enough income from investments and assets to cover living expenses without needing to work. It starts with spending less than you earn, investing consistently, and building passive income streams over time.",
        takeaway: "Financial freedom is a journey, not a destination.",
        quote: { text: "The goal isn't more money. The goal is living life on your terms.", author: "Chris Brogan" },
        example: "If your expenses are $3,000/month and your investments generate $3,500/month in passive income — you're financially independent.",
        quiz: [
          { q: "Financial independence means:", options: ["Being rich", "Not needing a paycheck to survive", "Having no expenses", "Winning the lottery"], answer: 1 },
          { q: "The first step is:", options: ["Quitting your job", "Spending less than you earn", "Buying luxury items", "Taking on debt"], answer: 1 },
        ],
      },
      {
        id: "fi-2", title: "The FIRE Movement", xp: 10,
        content: "FIRE = Financial Independence, Retire Early. The concept: save 50-70% of income, invest aggressively, retire in 10-15 years instead of 40. Even if full FIRE isn't your goal, the principles of high savings and smart investing apply to everyone.",
        takeaway: "You don't need to retire early — but the principles create freedom.",
        quote: { text: "Retirement is when you stop sacrificing today for an imaginary tomorrow.", author: "Naval Ravikant" },
        example: "Saving 50% of a $60,000 salary = $30,000/year invested. At 7% returns, that's ~$420,000 in 10 years — enough for many to be financially independent.",
        quiz: [
          { q: "FIRE stands for:", options: ["Financial Income and Real Estate", "Financial Independence, Retire Early", "Free Income for Retirement Earnings", "Fund Investments and Reduce Expenses"], answer: 1 },
          { q: "FIRE principles are useful even if you:", options: ["Never want to retire", "Don't want to retire early", "Are already retired", "Don't save"], answer: 1 },
        ],
      },
      {
        id: "fi-3", title: "Retirement Accounts", xp: 10,
        content: "401(k): employer-sponsored, often with matching (free money!). IRA: individual account with tax benefits. Roth: pay taxes now, withdraw tax-free later. Traditional: tax deduction now, pay taxes when you withdraw. Start contributing as early as possible.",
        takeaway: "Employer match = free money. Never leave it on the table.",
        quote: { text: "The best time to start was yesterday. The next best time is today.", author: "Unknown" },
        example: "If your employer matches 50% of contributions up to 6% of salary, and you earn $50,000: contribute $3,000, get $1,500 free. That's a 50% instant return!",
        quiz: [
          { q: "Employer matching in a 401(k) is:", options: ["A loan", "Free money", "A tax penalty", "Optional for employers"], answer: 1 },
          { q: "Roth accounts are taxed:", options: ["When you withdraw", "When you contribute", "Never", "Twice"], answer: 1 },
        ],
      },
      {
        id: "fi-4", title: "Taxes & Smart Planning", xp: 10,
        videoId: "ZJx3VNqJObs",
        content: "Understanding taxes helps you keep more money. Tax-advantaged accounts reduce your tax bill. Deductions lower taxable income. Credits directly reduce taxes owed. Filing taxes isn't as scary as it seems — free tools make it easy.",
        takeaway: "Understanding taxes puts money back in your pocket.",
        quote: { text: "In this world nothing can be said to be certain, except death and taxes.", author: "Benjamin Franklin" },
        example: "Contributing $6,000 to a Traditional IRA in the 22% tax bracket saves you $1,320 in taxes that year. That's money back in your pocket.",
        quiz: [
          { q: "Tax deductions:", options: ["Increase taxes owed", "Lower taxable income", "Are illegal", "Only apply to businesses"], answer: 1 },
          { q: "Tax credits:", options: ["Lower taxable income", "Directly reduce taxes owed", "Increase your salary", "Only help the wealthy"], answer: 1 },
        ],
      },
      {
        id: "fi-5", title: "Your Financial Action Plan", xp: 10,
        content: "Start today: 1) Track spending for 30 days. 2) Create a simple budget. 3) Build a $1,000 emergency fund. 4) Pay off high-interest debt. 5) Start investing even $25/month. 6) Learn continuously. Small steps compound into massive results over time.",
        takeaway: "The best financial plan is the one you actually start today.",
        quote: { text: "The journey of a thousand miles begins with a single step.", author: "Lao Tzu" },
        example: "Starting with just $25/month invested at 7% at age 18: by age 60 you'll have over $100,000. That's the power of starting small and staying consistent.",
        quiz: [
          { q: "The first step in a financial plan is:", options: ["Invest in crypto", "Track your spending", "Quit your job", "Get a credit card"], answer: 1 },
          { q: "What matters most is:", options: ["Starting with a large amount", "Starting today, even with small amounts", "Waiting until you earn more", "Timing the market"], answer: 1 },
        ],
      },
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
  const { hearts, maxHearts, gems, canDoLessons } = useGameEconomy();
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
      // Award XP for unit quiz
      await supabase.from("user_xp").insert({ user_id: user.id, xp_amount: 50, source: "unit-quiz", source_id: moduleId });
      // Award badge
      try { await supabase.from("user_badges").insert({ user_id: user.id, badge_name: badgeName, badge_icon: badgeIcon }); } catch (_) {}
      // Create certificate
      const certNumber = `FINOVA-${moduleId.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
      try {
        await supabase.from("certificates").insert({
          user_id: user.id,
          course_id: moduleId,
          certificate_number: certNumber,
          score: 100,
        });
      } catch (_) {}
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-xp"] });
      queryClient.invalidateQueries({ queryKey: ["user-badges"] });
      queryClient.invalidateQueries({ queryKey: ["certificates"] });
      toast.success("Certificate earned! Check your Certificates page.");
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

  // Show unit quiz
  if (showUnitQuiz) {
    const mod = modules.find(m => m.id === showUnitQuiz);
    const mi = modules.findIndex(m => m.id === showUnitQuiz);
    if (mod) {
      return (
        <UnitQuiz
          unitTitle={mod.title}
          questions={mod.unitQuiz}
          sectionColor={sectionColors[mi % sectionColors.length]}
          isCompleted={completedQuizzes.has(mod.id)}
          onComplete={() => {
            completeUnitQuizMutation.mutate({ moduleId: mod.id, badgeName: mod.badge, badgeIcon: mod.badgeIcon });
          }}
          onBack={() => setShowUnitQuiz(null)}
        />
      );
    }
  }

  // Show lesson module
  if (activeLessonData && activeModuleData) {
    const mi = modules.findIndex(m => m.id === activeModule);
    return (
      <LearningPathModule
        lesson={activeLessonData}
        moduleName={activeModuleData.title}
        sectionColor={sectionColors[mi % sectionColors.length]}
        isCompleted={completedLessons.has(activeLessonData.id)}
        onComplete={() => {
          completeLessonMutation.mutate({
            lessonId: activeLessonData.id,
            xp: activeLessonData.xp,
            moduleId: activeModuleData.id,
            badgeName: activeModuleData.badge,
          });
        }}
        onBack={() => { setActiveLesson(null); setActiveModule(null); }}
        isPending={completeLessonMutation.isPending}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Top stats bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold font-display">Learning Path</h1>
          <p className="text-sm text-muted-foreground">Master money skills, one lesson at a time</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/shop" className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 border border-red-200 hover:bg-red-100 transition-colors">
            <Heart className="w-4 h-4 text-red-500 fill-red-500" />
            <span className="font-bold text-sm text-red-600">{hearts}</span>
          </Link>
          <Link to="/shop" className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-50 border border-cyan-200 hover:bg-cyan-100 transition-colors">
            <Diamond className="w-4 h-4 text-cyan-500 fill-cyan-500" />
            <span className="font-bold text-sm text-cyan-600">{gems}</span>
          </Link>
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-orange-50 border border-orange-200">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="font-bold text-sm text-orange-600">{streak?.current_streak ?? 0}</span>
          </div>
        </div>
      </motion.div>

      <DailyChallenge />

      {badges && badges.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap gap-2">
          {badges.map(b => (
            <div key={b.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-xs font-bold text-amber-700">{b.badge_name}</span>
            </div>
          ))}
        </motion.div>
      )}

      {/* Vertical Skill Tree */}
      <div className="space-y-0">
        {modules.map((mod, mi) => {
          const modLessons = mod.lessons;
          const completedCount = modLessons.filter(l => completedLessons.has(l.id)).length;
          const isModuleComplete = completedCount === modLessons.length;
          const isModuleUnlocked = mi === 0 || (modules[mi - 1].lessons.every(l => completedLessons.has(l.id)) && completedQuizzes.has(modules[mi - 1].id));
          const hasBadge = badges?.some(b => b.badge_name === mod.badge);
          const quizUnlocked = isUnitQuizUnlocked(mi);
          const quizCompleted = completedQuizzes.has(mod.id);
          const hasCertificate = certificates?.some(c => c.course_id === mod.id);

          return (
            <motion.div
              key={mod.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: mi * 0.08 }}
            >
              {/* Section Header */}
              <div className={cn(
                "rounded-2xl p-5 mb-4 border",
                isModuleUnlocked ? sectionBgColors[mi % sectionBgColors.length] : "bg-muted/50 border-border opacity-60"
              )}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-white text-lg",
                      isModuleUnlocked ? sectionNodeBg[mi % sectionNodeBg.length] : "bg-muted-foreground/30"
                    )}>
                      {isModuleComplete && quizCompleted ? <CheckCircle2 className="w-5 h-5" /> : mi + 1}
                    </div>
                    <div>
                      <h3 className={cn("font-extrabold font-display text-lg", sectionTextColors[mi % sectionTextColors.length])}>
                        {mod.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">{completedCount}/{modLessons.length} lessons{quizCompleted ? " · Quiz ✓" : ""}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasCertificate && (
                      <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-100 border border-emerald-300">
                        <Award className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-[10px] font-bold text-emerald-700">Certified</span>
                      </div>
                    )}
                    {hasBadge && (
                      <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-100 border border-amber-300">
                        <Trophy className="w-3.5 h-3.5 text-amber-600" />
                        <span className="text-[10px] font-bold text-amber-700">{mod.badge}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="h-2 rounded-full bg-white/60 overflow-hidden">
                  <motion.div
                    className={cn("h-full rounded-full", sectionNodeBg[mi % sectionNodeBg.length])}
                    initial={{ width: 0 }}
                    animate={{ width: `${((completedCount + (quizCompleted ? 1 : 0)) / (modLessons.length + 1)) * 100}%` }}
                    transition={{ duration: 0.8, delay: mi * 0.1 }}
                  />
                </div>
              </div>

              {/* Lesson Nodes */}
              <div className="flex flex-col items-center gap-3 mb-4 px-4">
                {modLessons.map((lesson, li) => {
                  const unlocked = isLessonUnlocked(mi, li);
                  const completed = completedLessons.has(lesson.id);
                  const offset = li % 2 === 0 ? -40 : 40;

                  return (
                    <motion.div
                      key={lesson.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: mi * 0.08 + li * 0.05 }}
                      style={{ marginLeft: offset }}
                      className="relative"
                    >
                      {li > 0 && <div className="absolute -top-3 left-1/2 w-0.5 h-3 bg-border" />}
                      <button
                        onClick={() => { if (unlocked) { setActiveModule(mod.id); setActiveLesson(lesson.id); } }}
                        disabled={!unlocked}
                        className={cn(
                          "relative w-16 h-16 rounded-full flex items-center justify-center transition-all",
                          completed
                            ? cn(sectionNodeBg[mi % sectionNodeBg.length], "text-white shadow-lg")
                            : unlocked
                              ? cn(sectionNodeBgLight[mi % sectionNodeBgLight.length], "border-4", `border-current`, sectionTextColors[mi % sectionTextColors.length], "hover:scale-110 shadow-md cursor-pointer")
                              : "bg-muted border-2 border-border text-muted-foreground cursor-not-allowed"
                        )}
                      >
                        {completed ? <CheckCircle2 className="w-7 h-7" /> : unlocked ? <Target className="w-6 h-6" /> : <Lock className="w-5 h-5" />}
                      </button>
                      <p className={cn("text-xs font-semibold text-center mt-1.5 max-w-[100px]", !unlocked && "text-muted-foreground")}>
                        {lesson.title}
                      </p>
                    </motion.div>
                  );
                })}

                {/* Unit Quiz Node */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: mi * 0.08 + modLessons.length * 0.05 }}
                  className="relative mt-2"
                >
                  <div className="absolute -top-5 left-1/2 w-0.5 h-5 bg-border" />
                  <button
                    onClick={() => { if (quizUnlocked) setShowUnitQuiz(mod.id); }}
                    disabled={!quizUnlocked}
                    className={cn(
                      "relative w-20 h-20 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all border-2",
                      quizCompleted
                        ? "bg-emerald-500 text-white border-emerald-600 shadow-lg"
                        : quizUnlocked
                          ? cn("bg-amber-50 border-amber-400 text-amber-600 hover:scale-105 shadow-md cursor-pointer")
                          : "bg-muted border-border text-muted-foreground cursor-not-allowed"
                    )}
                  >
                    {quizCompleted ? <Award className="w-6 h-6" /> : quizUnlocked ? <Award className="w-6 h-6" /> : <Lock className="w-5 h-5" />}
                    <span className="text-[9px] font-bold">QUIZ</span>
                  </button>
                  <p className="text-xs font-bold text-center mt-1.5 max-w-[100px]">
                    {quizCompleted ? "✓ Certified" : "Unit Quiz"}
                  </p>
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default LearningPath;
