import express from "express";
import { createClient } from "@supabase/supabase-js";

const app = express();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

app.get("/client-urls/:client_slug", async (req, res) => {
  const clientSlug = req.params.client_slug;

  const { data: clientData, error: clientError } = await supabase
    .from("clients")
    .select("id")
    .eq("client_slug", clientSlug)
    .eq("status", "active")
    .single();

  if (clientError || !clientData) {
    return res.json({
      ok: true,
      client_slug: clientSlug,
      count: 0,
      rows: []
    });
  }

  const { data, error } = await supabase
    .from("internal_links")
    .select("url, meta_title, meta_description")
    .eq("client_id", clientData.id)
    .eq("status", "active");

  if (error) {
    return res.status(500).json({
      ok: false,
      error: error.message
    });
  }

  return res.json({
    ok: true,
    client_slug: clientSlug,
    count: data.length,
    rows: data
  });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});