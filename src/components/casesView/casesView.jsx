import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, MessageCircle } from "lucide-react";

const CasesView = () =>{
    const [descripcionCaso, setdescripcionCaso]= useState([]);
    const [nombreCaso, setNombreCaso]= useState([]);
    const [nombreAbogado, setnombreAbogado]= useState([]);
    return(
         <div className="card">
          <div className="card-content">
            <h2 className="title">Caso {nombreCaso}</h2>
                <p className="description">
                  <strong>Descripción:</strong> {descripcionCaso}
                </p>
                <p className="lawyer">Abogado {nombreAbogado}</p>
              </div>
              <div className="card-actions">
                <FileText className="icon" />
                <MessageCircle className="icon" />
                <button className="button">Ver más</button>
              </div>
            </div>
          
    );
};

export default CasesView;