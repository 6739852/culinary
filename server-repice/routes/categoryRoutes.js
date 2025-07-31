// יצירת ראוטר חדש של אקספרס
const router = express.Router();

/**
 * @description מסנכרן את כמות המתכונים לכל קטגוריה במסד הנתונים.
 * @route GET /sync-counts
 * @access Public
 */
router.get("/sync-counts", async (req, res) => { ... });

/**
 * @description מחזיר את כל הקטגוריות.
 * @route GET /
 * @access Public
 */
router.get("/", categoryController.getAllCategories);

/**
 * @description מחזיר את כל הקטגוריות כולל רשימת המתכונים של כל קטגוריה.
 * @route GET /with-recipes
 * @access Public
 */
router.get("/with-recipes", categoryController.getAllCategoriesWithRecipes);

/**
 * @description מחזיר קטגוריה לפי קוד מזהה.
 * @route GET /by-code/:code
 * @access Public
 */
router.get("/by-code/:code", categoryController.getCategoryByCode);

/**
 * @description מחזיר קטגוריה לפי שם.
 * @route GET /by-name/:name
 * @access Public
 */
router.get("/by-name/:name", categoryController.getCategoryByName);

/**
 * @description מוסיף קטגוריה חדשה (גישה למנהלים בלבד).
 * @route POST /
 * @access Admin
 */
router.post("/", verifyToken, isAdmin, categoryController.addCategory);