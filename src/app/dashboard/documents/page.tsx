import { createClient } from "@/lib/supabase/server";
import { DocumentUploader } from "@/components/document-uploader";
import { formatBytes, formatDate } from "@/lib/utils";

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
        <h1 className="text-2xl font-bold text-gray-900">My Files</h1>
        <p className="text-sm text-gray-600">
          Upload and manage your CV, Word docs, and supporting files.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <DocumentUploader />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-2">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-gray-500">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Size</th>
              <th className="px-4 py-3">Uploaded</th>
            </tr>
          </thead>
          <tbody>
            {(docs as DocumentRow[] | null)?.map((doc) => (
              <tr
                key={doc.id}
                className="border-t border-gray-100 text-gray-800"
              >
                <td className="px-4 py-3">{doc.name}</td>
                <td className="px-4 py-3">{doc.type}</td>
                <td className="px-4 py-3">
                  {doc.size_bytes ? formatBytes(doc.size_bytes) : "-"}
                </td>
                <td className="px-4 py-3">{formatDate(doc.created_at)}</td>
              </tr>
            ))}
            {!docs?.length && (
              <tr>
                <td className="px-4 py-6 text-gray-500" colSpan={4}>
                  No files yet. Upload your first CV above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
