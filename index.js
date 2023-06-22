let carouselIndex = 0;
let tilesCount = 0;
const tileWidth = 345;

const scroll = (direction) => {
  console.log(tilesCount);
  const container = document.getElementById("productList");
  const visibleTiles = Math.floor(container.offsetWidth / tileWidth);
  carouselIndex = Math.max(
    0,
    Math.min(tilesCount - visibleTiles + 1, carouselIndex + direction)
  );
  container.scrollTo({ left: carouselIndex * tileWidth, behavior: "smooth" });
};

document
  .getElementById("scrollRight")
  .addEventListener("click", () => scroll(1));
document
  .getElementById("scrollLeft")
  .addEventListener("click", () => scroll(-1));

const order = ["XXS", "XS", "S", "M", "L", "XL", "XXL"];

const customSizeSort = (a, b) => {
  const isRangeSizeA = a.includes("/");
  const isRangeSizeB = b.includes("/");

  if (!isNaN(a[0]) && !isNaN(b[0])) {
    const firstNumberA = parseInt(a.split("/")[0]);
    const firstNumberB = parseInt(b.split("/")[0]);

    return isRangeSizeA && isRangeSizeB
      ? firstNumberA - firstNumberB
      : isRangeSizeA
      ? 1
      : isRangeSizeB
      ? -1
      : parseInt(a) - parseInt(b);
  }

  const indexA = order.indexOf(a);
  const indexB = order.indexOf(b);

  return (
    (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB)
  );
};

const fetchData = async () => {
  const response = await fetch(
    "https://storage.googleapis.com/hush-dev-public/hush.json"
  );
  return response.json();
};

const createOption = (value) => {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = value;
  return option;
};

const getProductSizesByColor = (productData, color) => [
  ...new Set(
    productData.filter((item) => item.color === color).map((item) => item.size)
  ),
];

const updateColor = (productDiv, colorSelect, sizeSelect, productData) => {
  const selectedColor = colorSelect.value;
  const sizesForSelectedColor = getProductSizesByColor(
    productData,
    selectedColor
  );
  sizesForSelectedColor.sort(customSizeSort);

  productDiv.querySelector(
    ".product-image-text"
  ).textContent = `Available sizes: ${sizesForSelectedColor.join(", ")}`;

  const currentSize = sizeSelect.value;

  sizeSelect.innerHTML = "";

  sizesForSelectedColor.forEach((size) => {
    sizeSelect.appendChild(createOption(size));
  });

  const highestPriorityProduct = productData
    .filter((p) => p.color === selectedColor)
    .reduce((acc, cur) => (cur.priority > acc.priority ? cur : acc), {
      priority: -Infinity,
    });

  const defaultSize = highestPriorityProduct
    ? highestPriorityProduct.size
    : sizesForSelectedColor[0];

  sizeSelect.value = sizesForSelectedColor.includes(currentSize)
    ? currentSize
    : defaultSize;

  updateSize(productDiv, colorSelect, sizeSelect, productData);
};

const updateSize = (productDiv, colorSelect, sizeSelect, productData) => {
  const selectedColor = colorSelect.value;
  const selectedSize = sizeSelect.value;
  const selectedProduct = productData.find(
    (p) => p.color === selectedColor && p.size === selectedSize
  );

  if (selectedProduct) {
    const productImage = productDiv.querySelector(".product-image");
    productImage.src = selectedProduct.image;
    productImage.alt = selectedProduct.imageAlt;
  }
};

const displayProduct = (productDiv, productData) => {
  const colorGroups = productData.reduce((acc, item) => {
    if (!acc[item.color]) acc[item.color] = [];
    acc[item.color].push(item);
    return acc;
  }, {});

  let bestColor = null;
  let highestScore = Number.NEGATIVE_INFINITY;
  let maxSizes = -1;

  for (let color in colorGroups) {
    const group = colorGroups[color];
    const totalPriority = group.reduce((acc, item) => acc + item.priority, 0);

    if (
      totalPriority > highestScore ||
      (totalPriority === highestScore && group.length > maxSizes)
    ) {
      highestScore = totalPriority;
      maxSizes = group.length;
      bestColor = color;
    }
  }

  // If the product only has one color, automatically select that color.
  if (Object.keys(colorGroups).length === 1) {
    bestColor = Object.keys(colorGroups)[0];
  }

  const bestGroup = colorGroups[bestColor];
  bestGroup.sort((a, b) => b.priority - a.priority);
  const selectedProduct = bestGroup[0];

  const sizes = productData
    .filter((item) => item.color === selectedProduct.color)
    .map((item) => item.size);

  sizes.sort(customSizeSort);

  productDiv.innerHTML = `
        <div class="product-image-container">
            <img class="product-image" src="${selectedProduct.image}" alt="${
    selectedProduct.imageAlt
  }">
            <p class="product-image-text">Available sizes: ${sizes.join(
              ", "
            )}</p>
        </div>
        <div class="product-bottom">
            <div class="product-info">
                <h2>${selectedProduct.name}</h2>
                <p>£${selectedProduct.priceObj.value}</p>
            </div>
            <div class="product-selectors">
                <select class="color-select" aria-label="Color Selection"></select>
                <select class="size-select" aria-label="Size Selection"></select>
            </div>
            <button class="add-to-cart-button" aria-label="Add To Bag">ADD TO BAG</button>
        </div>`;

  const colorSelect = productDiv.querySelector(".color-select");
  const sizeSelect = productDiv.querySelector(".size-select");
  const addToCartButton = productDiv.querySelector(".add-to-cart-button");

  addToCartButton.addEventListener("click", () => {
    const selectedColor = colorSelect.value;
    const selectedSize = sizeSelect.value;
    const selectedProduct = productData.find(
      (p) => p.color === selectedColor && p.size === selectedSize
    );
    alert(
      `Added a size ${selectedProduct.size}, ${selectedProduct.color}, ${selectedProduct.name} to bag`
    );
  });

  const colors = [...new Set(productData.map((item) => item.color))];

  colors.forEach((color) => {
    colorSelect.appendChild(createOption(color));
  });

  sizes.forEach((size) => {
    sizeSelect.appendChild(createOption(size));
  });

  colorSelect.value = bestColor;

  colorSelect.addEventListener("change", () =>
    updateColor(productDiv, colorSelect, sizeSelect, productData)
  );
  sizeSelect.addEventListener("change", () =>
    updateSize(productDiv, colorSelect, sizeSelect, productData)
  );
};

fetchData()
  .then((products) => {
    const groupedProducts = products.reduce((acc, product) => {
      if (!acc[product.productId]) acc[product.productId] = [];
      acc[product.productId].push(product);
      return acc;
    }, {});

    tilesCount = Object.keys(groupedProducts).length;

    console.log(Object.values(groupedProducts));
    console.log(groupedProducts);
    Object.values(groupedProducts)
      .sort((a, b) => {
        // Calculate the average priority
        const avgPriorityA =
          a.reduce((acc, product) => acc + product.priority, 0) / a.length;
        const avgPriorityB =
          b.reduce((acc, product) => acc + product.priority, 0) / b.length;

        // Compare the average priorities
        if (avgPriorityA !== avgPriorityB) {
          return avgPriorityB - avgPriorityA;
        }

        // If average priorities are equal, compare the number of sizes
        const sizesA = new Set(a.map((product) => product.size)).size;
        const sizesB = new Set(b.map((product) => product.size)).size;

        return sizesB - sizesA;
      })
      .forEach((productGroup) => {
        const productDiv = document.createElement("div");
        productDiv.className = "product-tile";
        document.getElementById("productList").appendChild(productDiv);

        displayProduct(productDiv, productGroup);
      });
  })
  .catch((error) => console.error("Error:", error));
