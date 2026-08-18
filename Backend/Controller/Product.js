

export const getProduct = async (req, res) => {
    try {
        const {
            q,
            category,
            brand,
            minPrice,
            maxPrice,
            minRating,
            minDiscount,
            inStock,
            featured,
            trending,
            flashSale,
            newArrivals,
            bestSellers,
            sort = "newest",
            page = 1,
            limit = 20,
        } = req.query;
        const filter = { status: "Published" };

        if (q) filter.$text = { $search: q };
        if (category) filter.category = category;
        if (brand) filter.brand = brand;
        if (inStock === "true") filter.stock = { $gt: 0 };
        if (minRating) filter.ratings = { $gte: Number(minRating) };
        if (featured === "true") filter.isFeatured = true;
        if (trending === "true") filter.isTrending = true;
        if (flashSale === "true") {
            filter.isFlashSale = true;
            filter.flashSaleEndsAt = { $gt: new Date() };
        }
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }
        if (newArrivals === "true") {
            filter.createdAt = { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
        }

        let sortOption = SORT_OPTIONS[sort] || SORT_OPTIONS.newest;
        if (bestSellers === "true") sortOption = SORT_OPTIONS.best_selling;

        const pageNum = Math.max(Number(page), 1);
        const limitNum = Math.max(Number(limit), 1);
        const skip = (pageNum - 1) * limitNum;
        const [products, total] = await Promise.all([
            Product.find(filter)
                .populate("brand", "name logo")
                .populate("category", "name slug")
                .populate("seller", "storeName isVerifiedSeller")
                .sort(sortOption)
                .skip(skip)
                .limit(limitNum),
            Product.countDocuments(filter),
        ]);
        
    } catch (error) {

    }
}
export const getAllProducts = asyncHandler(async (req, res) => {
    const {
        q,
        category,
        brand,
        minPrice,
        maxPrice,
        minRating,
        minDiscount,
        inStock,
        featured,
        trending,
        flashSale,
        newArrivals,
        bestSellers,
        sort = "newest",
        page = 1,
        limit = 20,
    } = req.query;

    const filter = { status: "Published" };

    if (q) filter.$text = { $search: q };
    if (category) filter.category = category;
    if (brand) filter.brand = brand;
    if (inStock === "true") filter.stock = { $gt: 0 };
    if (minRating) filter.ratings = { $gte: Number(minRating) };
    if (featured === "true") filter.isFeatured = true;
    if (trending === "true") filter.isTrending = true;
    if (flashSale === "true") {
        filter.isFlashSale = true;
        filter.flashSaleEndsAt = { $gt: new Date() };
    }
    if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = Number(minPrice);
        if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (newArrivals === "true") {
        filter.createdAt = { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
    }

    let sortOption = SORT_OPTIONS[sort] || SORT_OPTIONS.newest;
    if (bestSellers === "true") sortOption = SORT_OPTIONS.best_selling;

    const pageNum = Math.max(Number(page), 1);
    const limitNum = Math.max(Number(limit), 1);
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
        Product.find(filter)
            .populate("brand", "name logo")
            .populate("category", "name slug")
            .populate("seller", "storeName isVerifiedSeller")
            .sort(sortOption)
            .skip(skip)
            .limit(limitNum),
        Product.countDocuments(filter),
    ]);

    const filtered = minDiscount
        ? products.filter((p) => p.discountPercent >= Number(minDiscount))
        : products;

    return successResponse(res, 200, "Products fetched successfully", {
        products: filtered,
        pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum),
        },
    });
});
