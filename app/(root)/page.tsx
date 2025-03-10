import ProductList from "@/components/shared/product/product-list";
import sampleData from "@/db/sample-data";

export const metadata = {
  title: "Home",
  description: "Home page of the Prostore",
}

const Home = async () => {
  return ( 
    <>
      <ProductList data={sampleData?.products} title="Newest Arrivals" limit={4}></ProductList>
    </>
  );
}

export default Home;