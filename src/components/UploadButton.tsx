import { useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UploadModal } from "./UploadModal";

const UploadButton = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setModalOpen(true)}
        className="bg-blue-600 hover:bg-blue-700"
      >
        <img
          src="/icons/uploadDoc.svg"
          alt="Upload Document"
          className="mr-2 h-4 w-4"
        />
        Analyse Document
      </Button>
      <UploadModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
};

export default UploadButton;