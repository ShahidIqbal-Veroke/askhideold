import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useCases } from "@/contexts/CaseContext";
import { File, Upload } from "lucide-react";

interface CreateCaseModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateCaseModal({ open, onOpenChange }: CreateCaseModalProps) {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        phoneNumber: "",
        email: "",
        address: "",
        claimAmount: "",
        assignedTo: "",
        caseType: "",
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const { toast } = useToast();
    const { createCase, loadCases } = useCases();

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            const maxSize = 6 * 1024 * 1024; // 6MB
            if (file.size > maxSize) {
                toast({
                    title: "File too large",
                    description: "File size must be 6MB or less",
                    variant: "destructive",
                });
                return;
            }
            setSelectedFile(file);
        }
    }, [toast]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const maxSize = 6 * 1024 * 1024; // 6MB
            if (file.size > maxSize) {
                toast({
                    title: "File too large",
                    description: "File size must be 6MB or less",
                    variant: "destructive",
                });
                return;
            }
            setSelectedFile(file);
        }
    };

    const handleCreate = async () => {
        // Validate required fields
        if (!formData.firstName || !formData.lastName || !formData.claimAmount || !formData.assignedTo || !formData.caseType) {
            toast({
                title: "Validation Error",
                description: "Please fill in all required fields",
                variant: "destructive",
            });
            return;
        }

        try {
            // Create case with empty alertIds array for manual creation
            const newCase = await createCase(
                [], // No alerts for manual case creation
                formData.assignedTo,
                formData.caseType.toLowerCase() as any
            );

            if (newCase) {
                // Update case with additional information if needed
                // You might want to extend the createCase function to accept more data

                toast({
                    title: "Case Created",
                    description: `Case ${newCase.reference} created successfully`,
                });

                // Reset form
                setFormData({
                    firstName: "",
                    lastName: "",
                    phoneNumber: "",
                    email: "",
                    address: "",
                    claimAmount: "",
                    assignedTo: "",
                    caseType: "",
                });
                setSelectedFile(null);
                onOpenChange(false);
                await loadCases();
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to create case",
                variant: "destructive",
            });
        }
    };

    const handleClose = () => {
        onOpenChange(false);
        setFormData({
            firstName: "",
            lastName: "",
            phoneNumber: "",
            email: "",
            address: "",
            claimAmount: "",
            assignedTo: "",
            caseType: "",
        });
        setSelectedFile(null);
        setDragActive(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-3xl rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="pb-1">
                    <DialogTitle className="text-2xl font-bold text-black text-center">
                        Create Case
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-2">
                    {/* Form Fields */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                        <div className="space-y-1">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                                id="firstName"
                                placeholder="Please Enter First Name"
                                value={formData.firstName}
                                onChange={(e) => handleInputChange("firstName", e.target.value)}
                            />
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                                id="lastName"
                                placeholder="Please Enter Last Name"
                                value={formData.lastName}
                                onChange={(e) => handleInputChange("lastName", e.target.value)}
                            />
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="phoneNumber">Phone Number</Label>
                            <Input
                                id="phoneNumber"
                                placeholder="Please Enter Phone Number"
                                value={formData.phoneNumber}
                                onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                            />
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Please Enter Email"
                                value={formData.email}
                                onChange={(e) => handleInputChange("email", e.target.value)}
                            />
                        </div>

                        <div className="space-y-1 col-span-2">
                            <Label htmlFor="address">Address</Label>
                            <Input
                                id="address"
                                placeholder="Please Enter Address"
                                value={formData.address}
                                onChange={(e) => handleInputChange("address", e.target.value)}
                            />
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="claimAmount">Claim Amount</Label>
                            <Input
                                id="claimAmount"
                                type="number"
                                placeholder="Please Enter Claim Amount"
                                value={formData.claimAmount}
                                onChange={(e) => handleInputChange("claimAmount", e.target.value)}
                            />
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="assignedTo">Assigned To</Label>
                            <Select value={formData.assignedTo} onValueChange={(value) => handleInputChange("assignedTo", value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Please Select Assignee" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="user1">User 1</SelectItem>
                                    <SelectItem value="user2">User 2</SelectItem>
                                    <SelectItem value="user3">User 3</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1 col-span-2">
                            <Label htmlFor="caseType">Case Type</Label>
                            <Select value={formData.caseType} onValueChange={(value) => handleInputChange("caseType", value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Please Select Case Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="urgent">Urgent</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="normal">Normal</SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* File Upload Section */}
                    <div
                        className={`relative border-2 border-dashed rounded-3xl p-6 transition-all ${dragActive
                                ? "border-blue-500 bg-blue-50"
                                : selectedFile
                                    ? "border-green-500 bg-green-50"
                                    : "border-slate-300 hover:border-slate-400 hover:bg-slate-100"
                            }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <input
                            type="file"
                            id="case-file-upload"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={handleFileSelect}
                            accept=".jpg,.jpeg,.png,.pdf,.docx,image/jpeg,image/png,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        />

                        <div className="flex items-center justify-between gap-6">
                            <div className="flex items-center gap-2 justify-center flex-1 min-w-0">
                                {selectedFile ? (
                                    <>
                                        <div className="flex-shrink-0">
                                            <File className="w-12 h-12 text-green-600" />
                                        </div>
                                        <div className="text-left min-w-0">
                                            <p className="text-green-700 font-semibold text-base truncate">{selectedFile.name}</p>
                                            <p className="text-sm text-green-600 mt-1">
                                                {(selectedFile.size / 1024 / 1024).toFixed(1)} MB • Ready
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex-shrink-0">
                                            <img src="/icons/gallery.svg" alt="Gallery" className="w-12 h-12" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-slate-800 font-semibold text-base mb-2">
                                                Drag and drop your Files
                                            </p>
                                            <p className="text-sm text-slate-600 mb-1">
                                                File formats are DOCX, PNG, JPG, PDF
                                            </p>
                                            <p className="text-sm text-slate-600">
                                                File size: 6MB max
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>

                            {!selectedFile && (
                                <Button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        document.getElementById('case-file-upload')?.click();
                                    }}
                                    className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 px-5 py-2.5 rounded-3xl font-medium flex-shrink-0 shadow-md hover:shadow-lg transition-all"
                                >
                                    <img src="/icons/document-upload.svg" alt="Upload" className="w-5 h-5" />
                                    <span>Upload Documents</span>
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-center gap-3 pt-2">
                        <Button
                            variant="outline"
                            onClick={handleClose}
                            className="border-2 border-blue-600 text-blue-600 bg-white hover:bg-blue-50 px-8 py-2.5 font-medium rounded-xl transition-all min-w-[160px]"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreate}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 font-medium rounded-xl shadow-md hover:shadow-lg transition-all min-w-[160px]"
                        >
                            Create
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

