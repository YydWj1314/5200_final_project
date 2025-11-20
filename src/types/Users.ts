export interface User {
  id: number; // int8 → number
  user_account: string; // varchar
  user_password: string; // varchar (哈希存储)
  union_id: string | null; // varchar
  mp_open_id: string | null; // varchar
  user_name: string | null; // varchar
  user_avatar: string | null; // varchar (URL)
  user_profile: string | null; // varchar (简介/描述)
  user_role: string | null; // varchar (user / admin 等)
  edited_at: string | null; // timestamptz → ISO string
  created_at: string; // timestamptz
  updated_at: string; // timestamptz
  is_delete: boolean; // bool
  question_collection: Record<string, any> | null; // jsonb
}

export interface UserGetById {
  id: number; // int8 → number
  user_name: string | null; // varchar
  user_account: string | null;
  user_avatar: string | null; // varchar (URL)
  user_profile: string | null; // varchar (简介/描述)
  user_role: string | null; // varchar (user / admin 等)
}

export interface Me {
  id: number | null;
  user_name: string | null;
  user_account: string | null;
  user_role: string | null;
}
