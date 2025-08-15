
import Navbar from "@/components/navbar";

const PrivateLayout = ({ children }: { children: React.ReactNode }) => {
    return (<>
        <main className=" ">
            <div className="mb-10">
                <Navbar />
            </div>
            
            {children}
        </main>

    </>);
}

export default PrivateLayout;