
import { createClient } from '@supabase/supabase-js';

// Chaves de acesso ao banco JOTAKA Cloud
// Segurança garantida via Row Level Security (RLS) no Supabase
const JTK_EP = 'https://cmsrwkulnkmqswiqneeu.supabase.co';
const JTK_AK = 'sb_publishable_U5tFBGnl1Xv1WTNS8lB3Lg_PLGutREj';

export const supabase = createClient(JTK_EP, JTK_AK);
