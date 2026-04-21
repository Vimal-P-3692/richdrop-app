import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log("AUTH USER:", currentUser);

      // 🔥 Reset state on change
      setLoading(true);
      setRole(null);

      if (currentUser) {
        setUser(currentUser);

        try {
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);

          console.log("FIRESTORE DATA:", docSnap.data());

          if (docSnap.exists()) {
            const userRole = docSnap.data()?.role;

            // ✅ Ensure role always exists
            setRole(userRole || "user");
          } else {
            console.warn("No user doc found → default role = user");
            setRole("user");
          }

        } catch (error) {
          console.error("Error fetching role:", error);

          // 🔥 fallback role (VERY IMPORTANT)
          setRole("user");
        }

      } else {
        setUser(null);
        setRole(null);
      }

      // ✅ Only stop loading AFTER everything is ready
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
}