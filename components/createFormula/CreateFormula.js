import { Fragment, useEffect, forwardRef } from "react";
import crypto from "crypto";
import Image from "next/image";
import { useState, useContext } from "react";
import { signIn, useSession } from "next-auth/react";

import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Button from "@mui/material/Button";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import LoadingButton from "@mui/lab/LoadingButton";
import WaterDropOutlinedIcon from "@mui/icons-material/WaterDropOutlined";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import Stack from "@mui/material/Stack";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import Divider from "@mui/material/Divider";
import { OutlinedInput } from "@mui/material";
import FormHelperText from "@mui/material/FormHelperText";
import Tooltip from "@mui/material/Tooltip";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import CloseSharpIcon from "@mui/icons-material/CloseSharp";
import { InputAdornment } from "@mui/material";
import { CartContext } from "../CartContext";

import classes from "../../styles/createFormula/CreateFormula.module.css";
import outputImageBg from "../../public/assets/outputImage_background.png";
import { flatMap } from "lodash";
import axios from "axios";
import { useRouter } from "next/router";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";

const ingreRaw = [
  {
    ingredient: {
      id: "645355c7ef19e3b71076cee3",
      isSelected: true,
    },
  },
  {
    ingredient: {
      id: "64535667ef19e3b71076cf0c",
      isSelected: false,
    },
  },
  {
    ingredient: {
      id: "6453577cef19e3b71076cf18",
      isSelected: true,
    },
  },
];

const Alert = forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const CreateFormula = ({ categoryData, ingredientData }) => {
  const router = useRouter();
  const { addProduct } = useContext(CartContext);
  const { cartProducts } = useContext(CartContext);
  const [ingreBuyNow, setIngreBuyNow] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const { data: session } = useSession();
  const [base, setBase] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [tabValue, setTabValue] = useState("1");
  const [loading, setLoading] = useState(false);
  const [showCreateFormulaButton, setShowCreateFormulaButton] = useState(true);
  const [variety, setVariety] = useState(
    // categoryData?.subcategories[0]?.category
    null
  );
  const [ingre, setIngre] = useState("");
  const [numLiter, setNumLiter] = useState(1);
  const [transformedProduct, setTransformedProducts] = useState("");
  const [hasMounted, setHasMounted] = useState(false);
  const [totalEstimatedCost, setTotalEstimatedCost] = useState(245);
  const [formula, setFormula] = useState(`
  To make this blend you will need:
  10ml jojoba oil
  15 drops frankincense essential oil
  9 drops lavender essential oil
  6 drops cedar wood essential oil
  15ml glass bottle (a roll-on bottle or one with a pipette works well)
  Directions:
  
  Pour the jojoba oil into a glass bottle.
  Add the drops of essential oils carefully.
  Place the lid on the bottle and shake gently to ensure all the oils are blended
  Cost Estimation:
  
  10ml Jojoba Oil: ₱ 120.00
  15 drops Frankincense Essential Oil: ₱ 50.00
  9 drops Lavender Essential Oil: ₱ 30.00
  6 drops Cedar Wood Essential Oil: ₱ 25.00
  15ml Glass Bottle: ₱ 20.00`);

  const [openCartSnackbar, setOpenCartSnackbar] = useState(false);
  const customProductName = categoryData.name;
  const categoryImage = categoryData.image;

  const randomBytes = crypto.randomBytes(16); // Generate a 16-byte (128-bit) random number
  const uniqueId = crypto
    .createHash("sha256")
    .update(randomBytes)
    .digest("hex");
  const productId = uniqueId.replace(/[^a-zA-Z0-9]/g, "");

  console.log(categoryData);
  console.log(ingredientData);
  console.log(ingredients);
  useEffect(() => {
    axios.get("/api/products").then((result) => {
      setIngreBuyNow(result.data);
    });
  }, []);

  // useEffect(() => {
  //   if (ingredientData && variety) {
  //     setIngre(ingredientData.find((ingre) => ingre.categoryId === variety));
  //   }
  // }, [ingredientData, variety]);

  useEffect(() => {
    if (hasMounted && cartProducts.length > 0) {
      cartSnackbarHandler();
      resetData();
    } else {
      setHasMounted(true);
    }
  }, [cartProducts.length]);

  const addIngredientHandler = (id, value) => () => {
    setIngredients((prev) => {
      const index = prev.findIndex((i) => i.ingredient.id === id);
      if (index !== -1) {
        // ingredient already exists, update isSelected
        return [
          ...prev.slice(0, index),
          {
            ...prev[index],
            ingredient: {
              ...prev[index].ingredient,
              isSelected: !prev[index].ingredient.isSelected,
            },
          },
          ...prev.slice(index + 1),
        ];
      } else {
        // ingredient doesn't exist, add it
        return [
          ...prev,
          {
            ingredient: { id, isSelected: true },
          },
        ];
      }
    });
  };
  console.log(ingredients);

  const baseHandler = (e) => {
    setBase(e.target.value);
  };

  const tabHandler = (event, newTabValue) => {
    setTabValue(newTabValue);
  };

  const varietyChangeHandler = (value) => () => {
    if (value !== variety) {
      setVariety(value);
    }
  };

  const convertImage = (image) => {
    const imageData = Buffer.from(image).toString("base64");
    return imageData;
  };

  function getSelectedIngredientIds(ingreRaw) {
    const selectedIds = [];
    if (ingreRaw) {
      ingreRaw.forEach((item) => {
        if (item.ingredient.isSelected) {
          selectedIds.push(item.ingredient.id);
        }
      });
    }

    return selectedIds;
  }

  const literChangeHandler = (e) => {
    setNumLiter(parseInt(e.target.value));
  };

  const resetData = () => {
    setVariety(categoryData.name);
    setIngre("");
    setTransformedProducts();
    setNumLiter(1);
    setIngredients([]);
    setOpenCartSnackbar(false);
    setShowCreateFormulaButton(true);
    setBase("");
    setQuantity(1);
    setTabValue("1");
    setTotalEstimatedCost(245);
    setFormula(`
    To make this blend you will need:
    10ml jojoba oil
    15 drops frankincense essential oil
    9 drops lavender essential oil
    6 drops cedar wood essential oil
    15ml glass bottle (a roll-on bottle or one with a pipette works well)
    Directions:
    
    Pour the jojoba oil into a glass bottle.
    Add the drops of essential oils carefully.
    Place the lid on the bottle and shake gently to ensure all the oils are blended
    Cost Estimation:
    
    10ml Jojoba Oil: ₱ 120.00
    15 drops Frankincense Essential Oil: ₱ 50.00
    9 drops Lavender Essential Oil: ₱ 30.00
    6 drops Cedar Wood Essential Oil: ₱ 25.00
    15ml Glass Bottle: ₱ 20.00`);
  };

  const createFormulaHandler = () => {
    const transformedProductRaw = [
      productId,
      categoryData.id,
      categoryData.name,
      categoryImage,
      formula,
      getSelectedIngredientIds(ingredients),
      numLiter,
      totalEstimatedCost,
    ];

    console.log(transformedProductRaw);

    setLoading((prev) => !prev);

    setTimeout(() => {
      setLoading(false);
      setShowCreateFormulaButton(false);
    }, 2000);
    setTransformedProducts(JSON.stringify(transformedProductRaw));
  };

  const cartSnackbarHandler = () => {
    setOpenCartSnackbar(true);
  };

  const cartSnackbarCloseHandler = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenCartSnackbar(false);
  };
  const addToCartHandler = (prod) => {
    addProduct(prod);
    cartSnackbarHandler();
    resetData();
  };

  const parseCartData = (cartDataRaw) => {
    if (cartDataRaw) {
      const cartData = JSON.parse(cartDataRaw);

      const [
        productId,
        categoryId,
        categoryName,
        categoryImage,
        formula,
        ingredients,
        numberOfLiter,
        totalEstimatedCost,
      ] = cartData;

      const result = [
        {
          categoryId,
          categoryImage,
          categoryName,
          formula,
          ingredients,
          numberOfLiter: parseInt(numberOfLiter),
          productId,
          totalEstimatedCost: parseInt(totalEstimatedCost),
        },
      ];

      return result;
    } else {
      return;
    }
  };

  function generateFormattedCartData(cartDatasRaw, ingreDataArrRaw) {
    if (cartDatasRaw && ingreDataArrRaw) {
      const formattedCartData = [];
      console.log(cartDatasRaw);
      console.log("😘😘😘");
      console.log(ingreDataArrRaw);

      for (const cartData of cartDatasRaw) {
        const {
          categoryId,
          categoryImage,
          categoryName,
          formula,
          ingredients,
          numberOfLiter,
          productId,
          totalEstimatedCost,
        } = cartData;
        const updatedIngredients = [];

        for (const ingredientId of ingredients) {
          const foundIngredient = ingreDataArrRaw?.find(
            (ingredient) => ingredient._id === ingredientId
          );

          console.log(foundIngredient);

          if (foundIngredient) {
            updatedIngredients.push(foundIngredient);
          }
        }

        console.log(numberOfLiter);
        console.log(updatedIngredients);

        const updatedTotalEstimatedCost = updatedIngredients.reduce(
          (totalCost, ingredient) => {
            return totalCost + ingredient.price;
          },
          0
        );

        const formattedCartObj = {
          categoryId,
          categoryImage,
          categoryName,
          formula,
          ingredients: updatedIngredients,
          numberOfLiter,
          productId,
          totalEstimatedCost: updatedTotalEstimatedCost * numberOfLiter,
        };

        formattedCartData.push(formattedCartObj);
      }

      return formattedCartData;
    } else {
      return;
    }
  }

  const goToCheckout = () => {
    if (session) {
      router.push({
        pathname: "/checkout",
        query: {
          productToPurchase: JSON.stringify(
            generateFormattedCartData(
              parseCartData(transformedProduct),
              ingreBuyNow
            )
          ),
        },
      });
    } else {
      router.push("/login");
    }
  };

  const handleAddToCart = () => {
    addProduct(transformedProduct);
    setOpenModal(true);
  };

  const modalCloseHandler = () => {
    setOpenModal(false);
  };

  const gotoHome = () => {
    router.push("/");
  };

  const gotoProductPage = () => {
    router.push("/category-formula");
  };

  // console.log(ingre);
  // console.log(variety);
  // console.log(categoryData.id);
  // console.log(categoryData.name);
  // console.log(formula);
  // console.log(getSelectedIngredientIds(ingredients));
  // console.log("❤️❤️❤️");
  // console.log(ingredients);
  // console.log(parseCartData(transformedProduct));
  // console.log(
  //   generateFormattedCartData(parseCartData(transformedProduct), ingreBuyNow)
  // );

  function transformIngredientData(ingredientRaw) {
    const transformedData = [];
    console.log(ingredientRaw);

    // Create a map to group ingredients by composition name
    const compositionMap = new Map();

    // Group ingredients by composition name
    for (const ingredient of ingredientRaw) {
      const { composition } = ingredient;

      if (composition && composition.name) {
        if (!compositionMap.has(composition.name)) {
          compositionMap.set(composition.name, []);
        }

        const ingredientRow = {
          name: ingredient.name,
          id: ingredient.id,
          description: ingredient.description,
          price: ingredient.price,
          image: ingredient.image,
        };

        compositionMap.get(composition.name).push(ingredientRow);
      }
    }

    // Transform the grouped ingredients into the desired format
    for (const [compositionName, ingredientsRow] of compositionMap) {
      transformedData.push({
        compositionName,
        ingredientsRow,
      });
    }

    return transformedData;
  }

  // Usage
  const transformedIngredients = transformIngredientData(ingredientData);
  console.log(transformedIngredients);

  return (
    <div
      className={`${classes.container} ${classes["create-formula-container"]}`}
    >
      {/* <Snackbar open={openCartSnackbar} autoHideDuration={2000} onClose={cartSnackbarCloseHandler}>
        <Alert onClose={cartSnackbarCloseHandler} severity="success" sx={{ width: "100%" }}>
          {`${numLiter} ${numLiter > 1 ? "liters" : "liter"} of ${categoryData.name} was added to your cart.`}
        </Alert>
      </Snackbar> */}
      <Modal
        open={openModal}
        onClose={modalCloseHandler}
        aria-labelledby="success-modal-title"
        aria-describedby="success-modal-description"
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            width: "400",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            borderRadius: "6px",
            boxShadow: 24,
            padding: "1.4rem",
          }}
        >
          <CloseSharpIcon
            onClick={modalCloseHandler}
            sx={{
              color: "#aaaaaa",
              alignSelf: "end",
              "&:hover": {
                color: "#444",
                transition: "color 0.15s",
              },
            }}
          />
          <p
            style={{
              alignSelf: "center",
              textAlign: "center",
              color: "#545454",
              fontSize: "18px",
              width: "76%",
              marginBottom: "2rem",
            }}
          >
            1 item was added to your cart. Do you want to create another
            product?
          </p>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Button
              sx={{ width: "40%" }}
              variant="contained"
              onClick={gotoProductPage}
            >
              YES
            </Button>
            <Button sx={{ width: "40%" }} variant="outlined" onClick={gotoHome}>
              NO
            </Button>
          </div>
        </Box>
      </Modal>
      {/*========================1) TITLE DRID ITEM =======================*/}
      <div className={classes["title"]}>
        {/* <h3 className={classes.classification}>{classification}</h3> */}
        <h2 className={classes["product-name"]}>{customProductName}</h2>
      </div>

      {/*=======================2) IMAGE DRID ITEM =======================*/}

      <div className={classes["image-wrapper"]}>
        {categoryData?.image && (
          <Image
            src={`data:image/jpeg;base64,${convertImage(
              categoryData.image.data
            )}`}
            alt="image of perfume"
            width={400}
            height={400}
            className={classes.image}
            loading="lazy"
          />
        )}
        {outputImageBg && (
          <Image
            src={outputImageBg}
            alt="background of image of perfume"
            className={classes["image-backgound"]}
            loading="lazy"
          />
        )}
      </div>

      {/*======================3) EDITOR DRID ITEM =======================*/}
      <div className={classes["editor-wrapper"]}>
        {/* <FormControl color="secondary" className={classes["base-wrapper"]}>
          <InputLabel id="base">
            Subcategory<span className={classes["oil__required"]}>*</span>
          </InputLabel>
          <Select
            required
            labelId="base"
            id="base"
            value={base}
            label="Subcategory"
            className={classes["base__select"]}
            onChange={baseHandler}
          >
            {categoryData.subcategories.map((categ) => (
              <MenuItem
                key={categ.categoryId}
                value={`${categ.category}`}
                onClick={varietyChangeHandler(categ.categoryId)}
              >
                {categ.category}
              </MenuItem>
            ))}
          </Select>
        </FormControl> */}

        {ingredientData && (
          <div>
            <FormControl sx={{ width: "100%" }}>
              <label className={classes["oil-title"]} htmlFor="product_name">
                Product Name
              </label>

              <OutlinedInput
                id="product_name"
                type="text"
                placeholder={`Name your ${categoryData.name}`}
                // inputProps={{ step: 1, min: 0 }}
                // endAdornment={
                //   <InputAdornment position="end">
                //     <Button variant="outlined" color="primary">
                //       Send
                //     </Button>
                //   </InputAdornment>
                // }
              />
            </FormControl>

            <FormControl sx={{ width: "100%", marginTop: "1rem" }}>
              <label className={classes["oil-title"]} htmlFor="product_name">
                Liter
              </label>

              <OutlinedInput
                required
                id="liter"
                type="number"
                inputProps={{ step: 1, min: 1 }}
                endAdornment={"L"}
                defaultValue={1}
                onChange={literChangeHandler}
              />
              <FormHelperText id="liter-helper-text">
                The liter of {categoryData.name}.
              </FormHelperText>
            </FormControl>
          </div>
        )}

        <div className={classes["ingredient-optoins-wrapper"]}>
          {ingredientData &&
            transformIngredientData(ingredientData).map((ingredient) => {
              return (
                <div
                  key={ingredient.compositionName}
                  className={classes["oils-wrapper"]}
                >
                  <h4 className={classes["oil-title"]}>
                    {ingredient.compositionName}
                    <span className={classes["oil__required"]}>*</span>
                  </h4>
                  <div className={classes["oils-wrapper__options"]}>
                    {ingredient.ingredientsRow.map((option) => {
                      return option.description ? (
                        <Tooltip title={option.description} key={option.id}>
                          <div
                            key={option.id}
                            className={classes["oil-option"]}
                            onClick={addIngredientHandler(
                              option.id,
                              option.title
                            )}
                          >
                            <div
                              className={`${classes["image-button"]} ${
                                ingredients.find(
                                  (i) => i.ingredient.id === option.id
                                )?.ingredient.isSelected && classes.selected
                              }`}
                            >
                              <div>
                                {option.image && (
                                  <Image
                                    src={`data:image/jpeg;base64,${convertImage(
                                      option.image.data
                                    )}`}
                                    width={50}
                                    height={50}
                                    alt={option.name}
                                    loading="lazy"
                                  />
                                )}
                              </div>
                            </div>
                            <p>{option.name}</p>
                          </div>
                        </Tooltip>
                      ) : (
                        <div
                          key={option.id}
                          className={classes["oil-option"]}
                          onClick={addIngredientHandler(
                            option.id,
                            option.title
                          )}
                        >
                          <div
                            className={`${classes["image-button"]} ${
                              ingredients.find(
                                (i) => i.ingredient.id === option.id
                              )?.ingredient.isSelected && classes.selected
                            }`}
                          >
                            <div>
                              {option.image && (
                                <Image
                                  src={`data:image/jpeg;base64,${convertImage(
                                    option.image.data
                                  )}`}
                                  width={50}
                                  height={50}
                                  alt={option.name}
                                  loading="lazy"
                                />
                              )}
                            </div>
                          </div>
                          <p>{option.name}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/*=====================4) OUTPUT DRID ITEM ========================*/}
      {!showCreateFormulaButton && (
        <div className={classes["formula-wrapper"]}>
          <Divider className={classes["output__divider--top"]} />

          <div className={classes["formula__tab"]}>
            <TabContext value={tabValue}>
              <TabList onChange={tabHandler} aria-label="lab API tabs example">
                <Tab
                  label="Formula"
                  value="1"
                  className={classes["formula-title"]}
                />
              </TabList>
              <TabPanel value="1" className={classes["tab-panel"]}>
                <div className={classes["ingredients-wrapper"]}>
                  <p className={classes["ingredients-header"]}>
                    To make this blend you will need:
                  </p>
                  <ul>
                    <li>10ml jojoba oil</li>
                    <li>15 drops frankincense essential oil</li>
                    <li>9 drops lavender essential oil</li>
                    <li>6 drops cedar wood essential oil </li>
                    <li>
                      15ml glass bottle (a roll-on bottle or one with a pipette
                      works well)
                    </li>
                  </ul>
                </div>
                <div className={classes["directions-wrapper"]}>
                  <p className={classes["directions-header"]}>Directions:</p>
                  <ul>
                    <li>Pour the jojoba oil into a glass bottle.</li>
                    <li>Add the drops of essential oils carefully.</li>
                    <li>
                      Place the lid on the bottle and shake gently to ensure all
                      the oils are blended
                    </li>
                  </ul>
                </div>
                <div className={classes["cost-estimation-wrapper"]}>
                  <p className={classes["cost-estimation-header"]}>
                    Cost Estimation:
                  </p>
                  <ul>
                    <li>10ml Jojoba Oil: ₱ 120.00</li>
                    <li>15 drops Frankincense Essential Oil: ₱ 50.00</li>
                    <li>9 drops Lavender Essential Oil: ₱ 30.00</li>
                    <li>6 drops Cedar Wood Essential Oil: ₱ 25.00</li>
                    <li>15ml Glass Bottle: ₱ 20.00</li>
                  </ul>
                </div>
              </TabPanel>
            </TabContext>
          </div>
          <Button
            className={classes["save-copy__button"]}
            variant="outlined"
            sx={{
              alignSelf: "center",
              padding: "0.8em 2em",
              borderRadius: "50px",

              textTransform: "uppercase",
              fontSize: "clamp(10px, 2vw, 12px)",
              fontFamily: "var(--font-poppins)",
              fontWeight: "normal",
            }}
            startIcon={<SaveAltIcon />}
          >
            Save a copy
          </Button>
          <Divider className={classes["output__divider--bottom"]} />
        </div>
      )}

      {/*======================5) ACTION BUTTONS GRID ITEM ========================*/}
      {ingre && (
        <div className={classes["actions-buttons-wrapper"]}>
          {showCreateFormulaButton ? (
            <LoadingButton
              onClick={createFormulaHandler}
              className={classes["create-formula__button"]}
              loading={loading}
              color="primary"
              loadingPosition="start"
              startIcon={<WaterDropOutlinedIcon />}
              size="medium"
              variant="contained"
              sx={{
                alignSelf: "center",
                padding: "0.8em 2em",
                borderRadius: "50px",
                textTransform: "uppercase",
                fontSize: "clamp(14px, 2vw, 15px)",
                fontWeight: "normal",
                letterSpacing: "1px",
                backgroundColor: "#de89a1",
                color: "#fff",
                outline: "none",
                border: "none",
              }}
            >
              <span>Create My Formula</span>
            </LoadingButton>
          ) : (
            <Fragment>
              <div className={classes["total-estimated-cost__wrapper"]}>
                <h4 className={classes["oil-title"]}>Total estimated cost</h4>
                <p className={classes["total-cost"]}>
                  ₱{totalEstimatedCost.toFixed(2)}
                </p>
              </div>
              <Stack
                direction="row"
                spacing={2}
                className={classes["stack-action-button"]}
              >
                <Button
                  variant="outlined"
                  startIcon={<ShoppingCartIcon />}
                  className={classes["add-to-cart__button"]}
                  sx={{
                    alignSelf: "center",
                    padding: "0.8em 2em",
                    borderRadius: "50px",
                    textTransform: "uppercase",
                    fontSize: "clamp(14px, 2vw, 15px)",
                    fontWeight: "normal",
                    letterSpacing: "1px",
                  }}
                  onClick={handleAddToCart}
                >
                  Add to cart
                </Button>
                <Button
                  variant="contained"
                  className={classes["buy-now__button"]}
                  sx={{
                    alignSelf: "center",
                    padding: "0.8em 2em",
                    borderRadius: "50px",
                    textTransform: "uppercase",
                    fontSize: "clamp(14px, 2vw, 15px)",
                    fontWeight: "normal",
                    letterSpacing: "1px",
                    backgroundColor: "#de89a1",
                    color: "#fff",
                    outline: "none",
                    border: "none",
                  }}
                  onClick={goToCheckout}
                >
                  Order now
                </Button>
              </Stack>
            </Fragment>
          )}
        </div>
      )}
    </div>
  );
};

export default CreateFormula;
