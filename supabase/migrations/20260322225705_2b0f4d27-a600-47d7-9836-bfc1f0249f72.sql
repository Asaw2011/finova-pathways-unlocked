
DO $$
DECLARE
  first_course_id UUID;
  first_module_id UUID;
  lesson_rec RECORD;
BEGIN
  -- Get the first course (non-premium or lowest sort_order)
  SELECT id INTO first_course_id FROM public.courses ORDER BY sort_order ASC, created_at ASC LIMIT 1;
  
  IF first_course_id IS NULL THEN
    RAISE NOTICE 'No courses found, skipping seed';
    RETURN;
  END IF;

  -- Get first module of that course
  SELECT id INTO first_module_id FROM public.modules WHERE course_id = first_course_id ORDER BY sort_order ASC LIMIT 1;

  IF first_module_id IS NULL THEN
    RAISE NOTICE 'No modules found, skipping seed';
    RETURN;
  END IF;

  -- Update lessons that have NULL content in the first module
  -- Lesson about budgeting / money basics
  FOR lesson_rec IN 
    SELECT id, title FROM public.lessons 
    WHERE module_id = first_module_id AND content IS NULL
    ORDER BY sort_order ASC LIMIT 4
  LOOP
    UPDATE public.lessons SET content = jsonb_build_object(
      'intro', 'Understanding your money is the foundation of financial success. Most people who feel broke are not underpaid — they are undertrackers. Research consistently shows that people who track their finances save 20% more than those who don''t. The 50/30/20 rule is one of the simplest frameworks: 50% of take-home pay goes to needs, 30% to wants, and 20% to savings or debt repayment. On a $2,000 paycheck, that means $400 is automatically building your future every single month.',
      'example', jsonb_build_object(
        'scenario', 'Marcus earns $1,800/month from his part-time job. He pays $600 in rent, $120 for his phone, $200 for groceries, and $80 for transportation. The rest he spends without tracking. At the end of the month he has $0 saved.',
        'question', 'Using the 50/30/20 rule on Marcus''s $1,800 income, how much should he be saving each month?',
        'options', jsonb_build_array('$180', '$360', '$540', '$720'),
        'correct', 1,
        'explanation', '20% of $1,800 = $360. Marcus''s needs total $1,000 (56% of income). His real problem is the untracked $800 going entirely to wants with nothing to savings.'
      ),
      'practice', jsonb_build_array(
        jsonb_build_object(
          'question', 'Which of the following is a FIXED expense in a monthly budget?',
          'options', jsonb_build_array('Groceries', 'Dining out', 'Monthly rent payment', 'Gas for your car'),
          'correct', 2,
          'explanation', 'Rent is fixed because it stays the same every month. Groceries, dining out, and gas are variable expenses you can adjust.'
        ),
        jsonb_build_object(
          'question', 'Keisha gets a $500 bonus. According to the 50/30/20 rule, how much should go to savings?',
          'options', jsonb_build_array('$50', '$100', '$150', '$250'),
          'correct', 1,
          'explanation', '20% of $500 = $100. Applying the same percentage to windfalls prevents lifestyle inflation.'
        ),
        jsonb_build_object(
          'question', 'What is the primary purpose of the 24-hour rule before making a purchase?',
          'options', jsonb_build_array('To get a better price', 'To avoid impulse spending', 'To compare prices online', 'To check your credit limit'),
          'correct', 1,
          'explanation', 'Waiting 24 hours lets the initial excitement fade and helps evaluate whether the purchase fits your budget.'
        )
      ),
      'quiz', jsonb_build_array(
        jsonb_build_object(
          'question', 'Under the 50/30/20 rule, what percentage is allocated to wants?',
          'options', jsonb_build_array('50%', '20%', '30%', '10%'),
          'correct', 2,
          'explanation', 'The 30% wants category covers non-essential spending like dining out, entertainment, and hobbies.'
        ),
        jsonb_build_object(
          'question', 'Jamie earns $3,000/month and spends $1,800 on needs. Is this within the 50/30/20 framework?',
          'options', jsonb_build_array('Yes, needs are exactly 50%', 'No, needs are 60% — too high', 'Yes, 60% on needs is fine', 'No, needs should be 20%'),
          'correct', 1,
          'explanation', '$1,800 / $3,000 = 60%. This exceeds the recommended 50% for needs.'
        ),
        jsonb_build_object(
          'question', 'Which budgeting method assigns a specific job to every single dollar of income?',
          'options', jsonb_build_array('50/30/20 rule', 'Zero-based budgeting', 'Envelope method', 'Pay yourself first'),
          'correct', 1,
          'explanation', 'Zero-based budgeting means income minus all assigned categories equals zero — every dollar has a purpose.'
        ),
        jsonb_build_object(
          'question', 'What does "pay yourself first" mean in practical terms?',
          'options', jsonb_build_array('Buy yourself a treat', 'Transfer to savings before spending', 'Pay all bills before saving', 'Invest your full paycheck'),
          'correct', 1,
          'explanation', 'Pay yourself first means automating a savings transfer on payday before you spend on anything else.'
        ),
        jsonb_build_object(
          'question', 'A budget works best when it is:',
          'options', jsonb_build_array('Written once and never changed', 'Reviewed and adjusted monthly', 'Only used when broke', 'Shared with your employer'),
          'correct', 1,
          'explanation', 'Reviewing your budget monthly lets you catch overspending early and stay aligned with your goals.'
        )
      )
    )
    WHERE id = lesson_rec.id;
  END LOOP;
END $$;
