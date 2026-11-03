import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

// O cliente lê a sessão salva assim que é criado. Na renderização estática da web
// não existe window, então ali ele não pode tocar no AsyncStorage nem agendar a renovação.
const isStaticRender = typeof window === 'undefined'

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_KEY!,
  {
    auth: {
      storage: isStaticRender ? undefined : AsyncStorage,
      autoRefreshToken: !isStaticRender,
      persistSession: !isStaticRender,
      detectSessionInUrl: false,
    },
  }
)
