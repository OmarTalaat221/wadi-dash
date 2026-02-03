const editorConfig = {
  readonly: false,
  height: 300,
  toolbar: true,
  spellcheck: true,
  language: "en",

  // ✅ Fix copy/paste issues
  askBeforePasteHTML: false,
  askBeforePasteFromWord: false,
  defaultActionOnPaste: "insert_clear_html",

  // ✅ Enable all clipboard features
  enableDragAndDropFileToEditor: true,

  // ✅ Fix toolbar issues
  toolbarAdaptive: false,
  toolbarSticky: false,

  // ✅ Counters
  showCharsCounter: true,
  showWordsCounter: true,
  showXPathInStatusbar: false,

  // ✅ Allow all editing features
  useSearch: true,
  allowResizeX: false,
  allowResizeY: true,

  // ✅ Disable problematic features
  disablePlugins: [],
  extraPlugins: [],

  // ✅ Events - prevent issues
  events: {},

  // ✅ Properly configured buttons
  buttons: [
    "bold",
    "italic",
    "underline",
    "strikethrough",

    "|",
    "font",
    "fontsize",
    "brush",

    "|",
    "align",
    "outdent",
    "indent",
    "|",
    "link",
    "table",
    "|",
    "undo",
    "redo",
    "|",
    "hr",
    "eraser",
    "copyformat",
    "|",
    "fullsize",
    "source",
  ],

  // ✅ Button settings for mobile
  buttonsMD: [
    "bold",
    "italic",
    "underline",

    "|",
    "font",
    "fontsize",
    "|",
    "link",
    "table",
    "|",
    "undo",
    "redo",
  ],

  buttonsSM: ["bold", "italic", "|", "link", "|", "undo", "redo"],

  buttonsXS: ["bold", "italic", "|", "link", "|", "undo", "redo"],

  // ✅ Remove size limit issues
  limitChars: false,
  limitHTML: false,
};

export default editorConfig;
