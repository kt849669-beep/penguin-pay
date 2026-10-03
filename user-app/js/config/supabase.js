// PenguinPay Client Database & Supabase Adapter
// Seamlessly handles Local Testing and Live Supabase Cloud Database

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.3/+esm";

// ==============================================================
// 1. SUPABASE CLOUD CONFIGURATION
// You can enter your live Supabase credentials here or in localStorage:
// ==============================================================
export const SUPABASE_CONFIG = {
  url: localStorage.getItem("penguinpay_supabase_url") || "https://pzpaxfsmkcgwjawghljr.supabase.co",
  anonKey: localStorage.getItem("penguinpay_supabase_anon_key") || "sb_publishable_as9C5edvb989q-pJ-sd_Lg_GizG_cIV",
  enabled: true
};

let remoteClient = null;
if (SUPABASE_CONFIG.enabled && SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey) {
  try {
    remoteClient = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
  } catch (e) {
    console.warn("Could not initialize remote Supabase client, falling back to local database:", e);
  }
}

// Function to dynamically connect live Supabase credentials at runtime
export function configureSupabase(url, anonKey) {
  if (url && anonKey) {
    localStorage.setItem("penguinpay_supabase_url", url);
    localStorage.setItem("penguinpay_supabase_anon_key", anonKey);
    SUPABASE_CONFIG.url = url;
    SUPABASE_CONFIG.anonKey = anonKey;
    SUPABASE_CONFIG.enabled = true;
    remoteClient = createClient(url, anonKey);
    console.log("Connected to live Supabase project:", url);
  }
}

// ==============================================================
// 2. LOCAL TEST DATABASE (In-Memory & LocalStorage with Realtime Sync)
// Keeps Mobile, Password, and MPIN in plain text during testing
// ==============================================================
const STORAGE_PREFIX = "penguinpay_table_";

function getTableData(table) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + table);
    if (!raw) {
      const defaults = getDefaultData(table);
      localStorage.setItem(STORAGE_PREFIX + table, JSON.stringify(defaults));
      return defaults;
    }
    return JSON.parse(raw);
  } catch (e) {
    return getDefaultData(table);
  }
}

function setTableData(table, data) {
  try {
    localStorage.setItem(STORAGE_PREFIX + table, JSON.stringify(data));
    notifyChange(table);
  } catch (e) {
    console.error("Local DB write error:", e);
  }
}

function notifyChange(table) {
  try {
    if (typeof BroadcastChannel !== "undefined") {
      const bc = new BroadcastChannel("penguinpay_db_channel");
      bc.postMessage({ type: "db_change", table, timestamp: Date.now() });
      bc.close();
    }
  } catch (e) {}
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("penguinpay_db_change", { detail: { table } }));
    window.dispatchEvent(new Event("storage"));
  }
}

function getDefaultData(table) {
  if (table === "admin_settings") {
    return [
      {
        id: "1",
        admin_email: "admin@penguinpay.com",
        admin_password: "admin@0123"
      }
    ];
  }
  if (table === "slider_images") {
    return [
      {
        id: "slide_1",
        image_url: "/assets/lucky-spin-banner.jpg",
        title: "Lucky Spin Wheel",
        display_order: 1,
        is_enabled: true
      }
    ];
  }
  if (table === "telegram_popup") {
    return [
      {
        id: "tel_1",
        is_enabled: false,
        telegram_url: "https://t.me/penguinpay"
      }
    ];
  }
  if (table === "banner_popup") {
    return [
      {
        id: "ban_1",
        is_enabled: false,
        banner_url: "",
        banner_title: "Welcome to PenguinPay"
      }
    ];
  }
  return [];
}

class LocalQueryBuilder {
  constructor(table) {
    this.table = table;
    this.filters = [];
    this.orderConfig = null;
    this.limitCount = null;
    this.isSingle = false;
    this.countMode = null;
    this.action = "select";
    this.payload = null;
  }

  select(columns = "*", options = {}) {
    if (options && options.count) {
      this.countMode = options.count;
    }
    return this;
  }

  eq(field, value) {
    this.filters.push((item) => String(item[field]) === String(value));
    return this;
  }

  neq(field, value) {
    this.filters.push((item) => String(item[field]) !== String(value));
    return this;
  }

  in(field, values) {
    const set = new Set((values || []).map(String));
    this.filters.push((item) => set.has(String(item[field])));
    return this;
  }

  order(field, { ascending = true } = {}) {
    this.orderConfig = { field, ascending };
    return this;
  }

  limit(count) {
    this.limitCount = count;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  insert(data) {
    this.action = "insert";
    this.payload = data;
    return this;
  }

  update(data) {
    this.action = "update";
    this.payload = data;
    return this;
  }

  delete() {
    this.action = "delete";
    return this;
  }

  async execute() {
    let rows = getTableData(this.table);

    if (this.action === "insert") {
      const items = Array.isArray(this.payload) ? this.payload : [this.payload];
      const inserted = items.map((item) => ({
        id: item.id || (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : "id_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9)),
        created_at: item.created_at || new Date().toISOString(),
        ...item
      }));
      rows = [...inserted, ...rows];
      setTableData(this.table, rows);
      return { data: this.isSingle ? inserted[0] : inserted, error: null };
    }

    if (this.action === "update") {
      let updatedCount = 0;
      rows = rows.map((item) => {
        const matches = this.filters.every((f) => f(item));
        if (matches) {
          updatedCount++;
          return { ...item, ...this.payload };
        }
        return item;
      });
      setTableData(this.table, rows);
      return { data: rows, error: null, count: updatedCount };
    }

    if (this.action === "delete") {
      const initialLength = rows.length;
      rows = rows.filter((item) => !this.filters.every((f) => f(item)));
      setTableData(this.table, rows);
      return { data: null, error: null, count: initialLength - rows.length };
    }

    // Default: SELECT
    let result = rows;
    for (const filter of this.filters) {
      result = result.filter(filter);
    }

    const totalCount = result.length;

    if (this.orderConfig) {
      const { field, ascending } = this.orderConfig;
      result = [...result].sort((a, b) => {
        const valA = a[field];
        const valB = b[field];
        if (valA === valB) return 0;
        if (valA === undefined || valA === null) return ascending ? -1 : 1;
        if (valB === undefined || valB === null) return ascending ? 1 : -1;
        return ascending
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
    }

    if (typeof this.limitCount === "number") {
      result = result.slice(0, this.limitCount);
    }

    if (this.isSingle) {
      return { data: result[0] || null, error: null, count: totalCount };
    }

    return {
      data: result,
      error: null,
      count: this.countMode ? totalCount : result.length
    };
  }

  then(resolve, reject) {
    return this.execute().then(resolve, reject);
  }
}

class LocalRealtimeChannel {
  constructor(name) {
    this.name = name;
    this.listeners = [];
  }

  on(event, filter, callback) {
    const handler = (e) => {
      if (typeof callback === "function") callback(e);
    };
    this.listeners.push(handler);
    if (typeof window !== "undefined") {
      window.addEventListener("penguinpay_db_change", handler);
    }
    return this;
  }

  subscribe(callback) {
    if (typeof callback === "function") {
      callback("SUBSCRIBED");
    }
    return this;
  }

  unsubscribe() {
    if (typeof window !== "undefined") {
      this.listeners.forEach((l) => window.removeEventListener("penguinpay_db_change", l));
    }
  }
}

// Unified client interface
export const supabase = {
  from(table) {
    if (remoteClient) {
      return remoteClient.from(table);
    }
    return new LocalQueryBuilder(table);
  },
  channel(name) {
    if (remoteClient) {
      return remoteClient.channel(name);
    }
    return new LocalRealtimeChannel(name);
  }
};
