import { createClient } from "@/lib/supabase/server";
import { DocumentUploader } from "@/components/document-uploader";
import { formatBytes, formatDate } from "@/lib/utils";

export const metadata = { title: "Files — Adam Careers" };

type DocumentRow = {
  id: string;
  name: string;
  type: string;
  size_bytes: number | null;
  created_at: string;
};

export default async function DashboardDocumentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: docs } = await supabase
    .from("documents")
    .select("id,name,type,size_bytes,created_at")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Files</h1>
        <p className="mt-1 text-sm text-gray-600">
          Upload your existing CV or supporting documents — Adam can pull
          experience from them when you build a tailored CV.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <DocumentUploader />
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Type</th>
              <th className="px-4 py-3 font-semibold">Size</th>
              <th className="px-4 py-3 font-semibold">Uploaded</th>
            </tr>
          </thead>
          <tbody>
            {(docs as DocumentRow[] | null)?.map((doc) => (
              <tr
                key={doc.id}
                className="border-t border-gray-100 text-gray-800"
              >
                <td className="px-4 py-3 font-medium">{doc.name}</td>
                <td className="px-4 py-3 text-gray-500">{doc.type}</td>
                <td className="px-4 py-3 text-gray-500">
                  {doc.size_bytes ? formatBytes(doc.size_bytes) : "—"}
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {formatDate(doc.created_at)}
                </td>
              </tr>
            ))}
            {!docs?.length && (
              <tr>
                <td
                  className="px-4 py-10 text-center text-sm text-gray-500"
                  colSpan={4}
                >
                  No files yet. Drop your first CV in the box above to get
                  started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
