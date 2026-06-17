-- Migration: enhance the exercises table with rich rehab metadata
-- Run this in the Supabase SQL editor against an existing database.
--
-- Adds descriptive / classification columns so exercises can be filtered by
-- body part, difficulty, rehab goals, target conditions, starting position and
-- equipment, then backfills every existing row and seeds any missing common
-- stroke-recovery exercises.

-- ============================================================
-- 1. Add the new columns
-- ============================================================

alter table exercises add column if not exists description text;
alter table exercises add column if not exists body_part text[];
alter table exercises add column if not exists difficulty text;
alter table exercises add column if not exists goals text[];
alter table exercises add column if not exists conditions text[];
alter table exercises add column if not exists position text;
alter table exercises add column if not exists equipment text[];
alter table exercises add column if not exists notes text;

-- ============================================================
-- 2. Backfill existing exercises
-- ============================================================

update exercises set
  description = 'Lie on your back with knees bent and feet flat, then lift your hips off the floor until your body forms a straight line from knees to shoulders, and lower back down.',
  body_part   = array['legs','core'],
  difficulty  = 'beginner',
  goals       = array['strength','balance'],
  conditions  = array['stroke_recovery','post_surgery','general_rehab'],
  position    = 'laying_down',
  equipment   = array['none'],
  notes       = 'Foundational glute and core activation; keep movement slow and controlled.'
where name = 'Bridges';

update exercises set
  description = 'Lie on your side with legs stacked and straight, then lift the top leg up and forward in a kicking motion before returning it under control.',
  body_part   = array['legs'],
  difficulty  = 'beginner',
  goals       = array['strength','mobility'],
  conditions  = array['stroke_recovery','general_rehab'],
  position    = 'laying_down',
  equipment   = array['none'],
  notes       = 'Targets hip abductors; keep hips stacked and avoid rolling backward.'
where name = 'Lay down side kicks';

update exercises set
  description = 'Lie on your back and pedal both legs in the air as if riding a bicycle, alternating knee-to-chest and extension.',
  body_part   = array['legs','core'],
  difficulty  = 'intermediate',
  goals       = array['strength','coordination','endurance'],
  conditions  = array['stroke_recovery','general_rehab'],
  position    = 'laying_down',
  equipment   = array['none'],
  notes       = 'Good for reciprocal coordination; start with a small range of motion.'
where name = 'Bicycle';

update exercises set
  description = 'Lying on your back, bend and draw the left leg up toward the chest, then lower it back down with control.',
  body_part   = array['legs'],
  difficulty  = 'beginner',
  goals       = array['mobility','flexibility'],
  conditions  = array['stroke_recovery','general_rehab'],
  position    = 'laying_down',
  equipment   = array['none'],
  notes       = 'Focus on active hip and knee flexion of the affected leg.'
where name = 'Laying down elevate left leg to chest';

update exercises set
  description = 'Lying on your side, draw the left knee up toward the chest and then kick the leg out straight before returning.',
  body_part   = array['legs'],
  difficulty  = 'intermediate',
  goals       = array['mobility','coordination','strength'],
  conditions  = array['stroke_recovery','general_rehab'],
  position    = 'laying_down',
  equipment   = array['none'],
  notes       = 'Combines hip flexion and extension; move slowly through the full range.'
where name = 'Lay down side elevate left knee to chest and kick';

update exercises set
  description = 'With electrodes applied to the quadriceps, lift and hold the left leg straight to strengthen the quad with electrical stimulation assistance.',
  body_part   = array['legs'],
  difficulty  = 'intermediate',
  goals       = array['strength'],
  conditions  = array['stroke_recovery','general_rehab'],
  position    = 'laying_down',
  equipment   = array['electrodes'],
  notes       = 'Uses neuromuscular electrical stimulation to assist quad activation.'
where name = 'Elevate left leg to strengthen quad with electrodes';

update exercises set
  description = 'Lying down with the left leg straight, slide the leg side to side across the surface in controlled swipes.',
  body_part   = array['legs'],
  difficulty  = 'beginner',
  goals       = array['mobility','coordination'],
  conditions  = array['stroke_recovery','general_rehab'],
  position    = 'laying_down',
  equipment   = array['none'],
  notes       = 'Trains hip abduction/adduction control with reduced gravity.'
where name = 'Left leg side to side swipes';

update exercises set
  description = 'Lying on your back with the leg straight, press the back of the knee down into the surface to tighten the quadriceps, hold, then relax.',
  body_part   = array['legs'],
  difficulty  = 'beginner',
  goals       = array['strength'],
  conditions  = array['stroke_recovery','post_surgery','general_rehab'],
  position    = 'laying_down',
  equipment   = array['none'],
  notes       = 'Classic quad set; hold each contraction for several seconds.'
where name = 'Lay down push down quad';

update exercises set
  description = 'From standing, balance and bear weight on a single leg, holding the position before switching or resting.',
  body_part   = array['legs','core','full_body'],
  difficulty  = 'advanced',
  goals       = array['balance','strength','coordination'],
  conditions  = array['stroke_recovery','general_rehab','fall_prevention'],
  position    = 'standing',
  equipment   = array['none'],
  notes       = 'Use a stable surface or bar for support and ensure supervision.'
where name = 'Standing up with one leg';

update exercises set
  description = 'Lie on your back with knees bent, then lift the hips using only the left leg while keeping the other foot off the floor.',
  body_part   = array['legs','core'],
  difficulty  = 'intermediate',
  goals       = array['strength','balance'],
  conditions  = array['stroke_recovery','general_rehab'],
  position    = 'laying_down',
  equipment   = array['none'],
  notes       = 'Single-leg progression of the bridge; emphasizes the affected side.'
where name = 'Bridges with left leg only';

update exercises set
  description = 'Lying on your back, raise both straight legs off the floor together and lower them back down with control.',
  body_part   = array['legs','core'],
  difficulty  = 'intermediate',
  goals       = array['strength','endurance'],
  conditions  = array['stroke_recovery','general_rehab'],
  position    = 'laying_down',
  equipment   = array['none'],
  notes       = 'Engages hip flexors and core; keep the lower back pressed down.'
where name = 'Laying down elevate both legs';

update exercises set
  description = 'Lying on your back with knees bent, place a ball between the knees and squeeze it together, hold, then release.',
  body_part   = array['legs','core'],
  difficulty  = 'beginner',
  goals       = array['strength'],
  conditions  = array['stroke_recovery','general_rehab'],
  position    = 'laying_down',
  equipment   = array['ball'],
  notes       = 'Strengthens hip adductors; hold each squeeze for several seconds.'
where name = 'Squeeze ball with knees bent';

update exercises set
  description = 'Lying on your back with knees bent, press the knees outward against resistance, then return under control.',
  body_part   = array['legs','core'],
  difficulty  = 'beginner',
  goals       = array['strength'],
  conditions  = array['stroke_recovery','general_rehab'],
  position    = 'laying_down',
  equipment   = array['band'],
  notes       = 'Targets hip abductors; a resistance band around the knees adds load.'
where name = 'Knees bent push out';

update exercises set
  description = 'With the legs propped on a pillow, point and flex the feet up and down to move the ankles through their range.',
  body_part   = array['legs'],
  difficulty  = 'beginner',
  goals       = array['mobility','endurance'],
  conditions  = array['stroke_recovery','post_surgery','general_rehab'],
  position    = 'laying_down',
  equipment   = array['pillow'],
  notes       = 'Ankle pumps to promote circulation and ankle dorsiflexion/plantarflexion.'
where name = 'Propped legs on pillow elevate feet up and down';

update exercises set
  description = 'With the legs propped on a pillow, press the feet downward (plantarflexion) and return.',
  body_part   = array['legs'],
  difficulty  = 'beginner',
  goals       = array['strength','mobility'],
  conditions  = array['stroke_recovery','post_surgery','general_rehab'],
  position    = 'laying_down',
  equipment   = array['pillow'],
  notes       = 'Strengthens the calf and ankle plantarflexors.'
where name = 'Propped legs on pillow push feet down';

update exercises set
  description = 'Lying on your back with knees bent and holding a ball, move the ball through a controlled path to challenge coordination and core control.',
  body_part   = array['legs','core'],
  difficulty  = 'intermediate',
  goals       = array['coordination','strength','balance'],
  conditions  = array['stroke_recovery','general_rehab'],
  position    = 'laying_down',
  equipment   = array['ball'],
  notes       = 'Combines limb control with core stabilization.'
where name = 'Knees bent holding ball moving';

-- ============================================================
-- 3. Seed missing common stroke-recovery exercises
--    (uses the same category check constraint: legs / arms / torso)
-- ============================================================

insert into exercises
  (name, category, date_introduced, description, body_part, difficulty, goals, conditions, position, equipment, notes)
values
  -- ARMS
  ('Shoulder flexion arm raises', 'arms', '2026-06-10',
   'Seated or standing, raise the affected arm forward and up overhead as far as comfortable, then lower with control.',
   array['arms'], 'beginner',
   array['mobility','strength'], array['stroke_recovery','general_rehab'],
   'sitting', array['none'],
   'Assist with the unaffected hand if needed to complete the range.'),

  ('Bicep curls with weights', 'arms', '2026-06-10',
   'Holding a light weight, bend the elbow to bring the hand toward the shoulder, then lower slowly.',
   array['arms'], 'beginner',
   array['strength'], array['stroke_recovery','general_rehab'],
   'sitting', array['weights'],
   'Start with a very light weight and progress gradually.'),

  ('Wrist flexion and extension', 'arms', '2026-06-10',
   'With the forearm supported, bend the wrist up and down through its full range.',
   array['arms'], 'beginner',
   array['mobility','flexibility'], array['stroke_recovery','general_rehab'],
   'sitting', array['none'],
   'Helps restore wrist range of motion; can be assisted with the other hand.'),

  ('Hand grip ball squeeze', 'arms', '2026-06-10',
   'Hold a soft ball in the hand and squeeze it, hold briefly, then release.',
   array['arms'], 'beginner',
   array['strength','coordination'], array['stroke_recovery','general_rehab'],
   'sitting', array['ball'],
   'Builds grip strength and finger control.'),

  ('Tabletop towel slides', 'arms', '2026-06-10',
   'Resting the affected arm on a towel on a table, slide the arm forward and back across the surface.',
   array['arms'], 'beginner',
   array['mobility','coordination'], array['stroke_recovery','general_rehab'],
   'sitting', array['none'],
   'Gravity-reduced shoulder and elbow movement for early recovery.'),

  -- TORSO / CORE
  ('Seated trunk rotations', 'torso', '2026-06-10',
   'Sitting tall, rotate the upper body to one side and then the other, keeping the hips facing forward.',
   array['torso','core'], 'beginner',
   array['mobility','balance'], array['stroke_recovery','general_rehab'],
   'sitting', array['none'],
   'Improves trunk mobility and seated balance.'),

  ('Seated side bends', 'torso', '2026-06-10',
   'Sitting upright, lean the torso to one side reaching toward the floor, then return and repeat to the other side.',
   array['torso','core'], 'beginner',
   array['mobility','flexibility'], array['stroke_recovery','general_rehab'],
   'sitting', array['none'],
   'Stretches and activates the lateral trunk muscles.'),

  ('Seated weight shifts', 'torso', '2026-06-10',
   'Sitting on a firm surface, shift body weight from side to side and front to back to challenge trunk control.',
   array['torso','core'], 'beginner',
   array['balance','coordination'], array['stroke_recovery','general_rehab','fall_prevention'],
   'sitting', array['none'],
   'Builds dynamic sitting balance.'),

  -- LEGS / STANDING / WALKING
  ('Sit to stand', 'legs', '2026-06-10',
   'From a seated position, stand up fully and then sit back down with control, using the legs to power the movement.',
   array['legs','core','full_body'], 'intermediate',
   array['strength','balance','endurance'], array['stroke_recovery','general_rehab','fall_prevention'],
   'sitting', array['none'],
   'Use armrests for assistance initially; key functional transfer skill.'),

  ('Standing heel raises', 'legs', '2026-06-10',
   'Standing with support, rise up onto the toes lifting the heels, then lower back down.',
   array['legs'], 'intermediate',
   array['strength','balance'], array['stroke_recovery','general_rehab','fall_prevention'],
   'standing', array['bar'],
   'Hold a stable surface or bar for support.'),

  ('Marching in place', 'legs', '2026-06-10',
   'Standing with support, lift one knee up and then the other in a marching rhythm.',
   array['legs','core','full_body'], 'intermediate',
   array['coordination','endurance','balance'], array['stroke_recovery','general_rehab','fall_prevention'],
   'standing', array['bar'],
   'Promotes weight shifting and stepping coordination for gait.'),

  ('Heel-to-toe walking', 'legs', '2026-06-10',
   'Walk in a straight line placing the heel of one foot directly in front of the toes of the other.',
   array['legs','full_body'], 'advanced',
   array['balance','coordination'], array['stroke_recovery','general_rehab','fall_prevention'],
   'walking', array['none'],
   'Tandem gait drill; perform near a wall or rail with supervision.');
