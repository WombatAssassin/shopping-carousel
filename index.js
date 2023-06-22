let carouselIndex = 0;
let tilesCount = 0;
const tileWidth = 345;

//create function with (direction) as parameter
//get container by ID
//get visible tiles with math.floor

//set carousel index limit - math.max between 0 and math.min (which is between totalTiles - visibleTiles + 1 and index + direction)
//scroll container to correct position

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

// create customSizeSort function with (a, b) passed in
// create consts for if size a/b is range with includes

// if both are numbers
// create consts for first number of a/b
// ternaries checking if
// 1. both are ranges
// 2. a is range
// 3. b is range
// else return a - b

// if else for 'both are numbers'
// return index of order for a/b as a - b

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

//create fetchData as an async function
//create response = awaited fetch of data
// return response.json
const fetchData = async () => {
  const response = await fetch(
    "https://storage.googleapis.com/hush-dev-public/hush.json"
  );
  return response.json();
};

//create createOption function passing in (value)
// create option element as const
//set option value
//set option textContent
//return option
const createOption = (value) => {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = value;
  return option;
};

//create getProductSizeByColor function passing in (productData, color)
//return as an array
//pass into array a new set
//containing product data - filtered for item color, and - mapped to display item size

const getProductSizesByColor = (productData, color) => [
  ...new Set(
    productData.filter((item) => item.color === color).map((item) => item.size)
  ),
];

//create updateColor func passing in 4 parameters - 2 of WHAT you wanna change, 1 where, and 1 of info
//create selectedColor const
//create sizesForSelectedColor const
//sort sizes by custom sort

//query select the product image text inside product div, and set text content to available sizes, joined with ", "

//create currentSize const before clearing the current size html content
//create new size options for size dropdown based on selected color

//create var to find highest priority product via filter and reduce
//set the default size to the highest priority product if it exists, else set to [0] in sizes
//if current size is included in list of sizes, set it to that, else set to default size

//call update size and pass in 4 original parameters

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

//create updateSize function - passing in 2 of WHAT you wanna change, 1 where, and 1 of info
//const for selected color and for selected size
//const using 'find' for selected product &&

//if selected product exists, change product image src and alt to selected product
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

//create displayProduct function - passing in productDiv and Data
//create const of colorGroups using reduce, returning an object of color arrays if push
//create bestColor, highestScore and maxSizes consts all @ base or lower

//create a for in loop of each color in colorGroups
//create group const
//create totalPriority const with reduce
//if total priority > highest score OR they have same priority, but larger maxSizes, reassign all 3 vars above

//if product only has 1 color, select that color as best

//create bestGroup const
//sort group high to low
//set selected product to highest prio

//create sizes const filter map
//sort sizes

//set productDiv innerHTML on selected product

//query select both selects and add to cart button
//add to cart event listener alert selectedProduct size color and name

//create const colors - list of all colors in data

//create color and size option in select for each available
//set color select to best color

//colorselect and size add event listeners

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

    // Choose the color with the highest total priority.
    // If total priority is equal, choose the color with more sizes.
    // If the number of sizes is also equal, choose the first one.
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

//call fetchData
//then arrow function passing in products
//create const groupedProducts = reduced products

//assign tilesCount

//sort grouped products
// - const average prio A/B
// - if prios are not the same, sort high to low
// - const number of sizes A/B
// - sort high to low

//then for each product group, make a tile div classname x, and append it to document
//run display product - pass in div and group

//catch any errors

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
