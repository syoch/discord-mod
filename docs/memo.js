let object_keys = function (o) { try { return Object.keys(o) } catch { return [] } };

let has_keys = (m, keys) => keys.every(k => m.hasOwnProperty(k));
let only_keys = (m, keys) => has_keys(m, keys) && object_keys(m).length === keys.length;

let isStringTable = m => object_keys(m).every(k => typeof m[k] === "string");
let isIcon = m => (k => k.length === 1 && k[0].endsWith("Icon"))(object_keys(m));

let oauthUser = x => x?.openOAuth2Modal;

// --------------------------

let modules = Object.values(patcher.req.c).
  map(extractModule).
  filter(x =>
    !isNumericStore(x) &&
    !isExperiment(x) &&
    !isIcon(x) &&
    !isStringTable(x) &&
    !isFormDefinition(x) &&
    !x._dispatcher
  ).
  filter(x => object_keys(x).length);

//        Logger : ["isTracing_", "logGroups", "logs", "prefix"]
// <logger>.logs.map(m=>m.emoji + " " + m.prefix + m.log).map(x=>console.log(x)), {}

// Auto Complete : ["AUTOCOMPLETE_OPTIONS", "AUTOCOMPLETE_PRIORITY"]

// Stores
// - ExperimentStore: テスト機能の状態保持


// L1 formatter: M.default.[parse, parsePreprocessor, unparse]
// MessageManager: M.default.[clearChannel, crosspostMessage, deleteMessage, editMessage, fetchMessages]

// 188315.MultiBackendImpl
// 241845 Trigger debugging user/guild aa experiments
// 355025 build override

// 2023-03_improved_message_markdown