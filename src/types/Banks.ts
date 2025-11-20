export type Bank = {
  id: number;
  title: string;
  topic: string;
  description: string | null;
  picture: string | null;
  user_id: string | number | null;
  created_at: string;
  edited_at: string;
  updated_at: string;
  is_delete: boolean;
};

//id, title, topic, description
export interface BankInShowList {
  id: number;
  title: string;
  topic: string;
  description: string | null;
}
