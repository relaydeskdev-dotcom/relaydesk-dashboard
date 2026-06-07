import Link from "next/link";
import { supabase } from "@/lib/supabase";
import 메일목록클라이언트, { EmailRow } from "@/components/메일목록클라이언트";
import 관리메뉴 from "@/components/관리메뉴";

export default async function Home() {
  const { data, error } = await supabase
    .from("emails")
    .select("*")
    .order("수신 시각", { ascending: false })
    .limit(200);
  const emails = (data ?? []) as EmailRow[];

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-[1500px] px-6 py-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              이메일 대시보드
            </h1>

            
          </div>

          <div className="flex items-center gap-2">
  <관리메뉴 />

  <div className="rounded-xl border bg-white px-4 py-2 text-sm text-gray-600">
    총 {emails.length}건
  </div>
</div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-300 bg-red-50 p-4 text-red-700">
            데이터 불러오기 오류: {error.message}
          </div>
        )}

        <메일목록클라이언트 emails={emails} />
      </div>
    </main>
  );
}