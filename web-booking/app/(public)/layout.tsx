
const PublicLayout = ({ children }: { children: React.ReactNode }) => {
    return ( 
        <main className="container my-6">
            {children}
        </main>
    );
}
 
export default PublicLayout;