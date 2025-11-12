import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';

export type CaseCardProps = {
    caseItem: {
        id: string;
        reference: string;
        status: 'open' | 'investigating' | 'pending_review' | 'closed';
        priority?: 'urgent' | 'high' | 'normal' | 'low';
        investigation_team?: string;
        assigned_to?: string;
        created_at: string;
        estimated_loss?: number;
        roi_score?: number;
        relatedInsured?: {
            name?: string;
            prenom?: string;
            nom?: string;
        };
    };
    isSelected?: boolean;
    onClick?: () => void;
    onOpenClick?: () => void;
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'open': return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'investigating': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'pending_review': return 'bg-orange-100 text-orange-800 border-orange-200';
        case 'closed': return 'bg-green-100 text-green-800 border-green-200';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const getPriorityColor = (priority?: string) => {
    switch (priority) {
        case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
        case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
        case 'normal': return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'low': return 'bg-green-100 text-green-800 border-green-200';
        default: return 'bg-gray-100 text-gray-800';
    }
};

export const CaseCard: React.FC<CaseCardProps> = ({
    caseItem,
    isSelected = false,
    onClick,
    onOpenClick
}) => {
    const bgClass = isSelected
        ? 'border-blue-500 bg-blue-50'
        : 'border-slate-200 hover:bg-slate-50';

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div
            onClick={onClick}
            className={`p-4 rounded-lg border cursor-pointer transition-all ${bgClass}`}
        >
            <div className="space-y-3">
                {/* Header */}
                <div className=" flex flex-col">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2 mb-1">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span className="font-medium text-sm">{caseItem.reference}</span>
                        </div>
                        <Badge className={getStatusColor(caseItem.status)} variant="outline">
                            {caseItem.status}
                        </Badge>
                    </div>
                    <div className="flex flex-row items-start justify-between">
                        {/* <Badge className={getStatusColor(caseItem.status)} variant="outline">
              {caseItem.status}
            </Badge> */}
                        {/* <p className="text-xs text-slate-600"> */}
                        <span>
                            <span className="font-medium">ID:</span> {caseItem.id}</span>
                        <span>
                            <span className="font-medium">Team:</span> {caseItem.investigation_team}</span>
                        {/* </p> */}
                        {/* {caseItem.priority && (
              <Badge className={getPriorityColor(caseItem.priority)} variant="outline">
                {caseItem.priority}
              </Badge>
            )} */}
                    </div>
                </div>

                <div className="flex flex-row items-start justify-between text-xs">
                    <Badge variant="outline">
                        <div className="flex items-center space-x-1">
                            <User className="w-4 h-4 text-gray-500" />
                            <span>Related Insured: {caseItem.assigned_to}</span>
                        </div>
                    </Badge>
                    {caseItem.priority && (
                        <Badge className={getPriorityColor(caseItem.priority)} variant="outline">
                            {caseItem.priority}
                        </Badge>
                    )}

                </div>


                {/* Footer */}
                <div className="flex items-center justify-start gap-3 text-xs text-[#000000B2]">
                    <div className='flex flex-row items-start space-x-1'>
                        <p className="text-slate-500"><span className='font-medium'>•</span> Estimated Loss</p>
                        <p className="font-medium">{formatCurrency(caseItem.estimated_loss || 0)}</p>
                    </div>
                    <div className='flex flex-row items-start space-x-1'>
                        <p className="text-slate-500"><span className='font-medium'>•</span> ROI</p>
                        <p className={`font-medium ${(caseItem.roi_score || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(caseItem.roi_score || 0)}
                        </p>
                    </div>
                    <span className='flex flex-row items-start space-x-1'>
                        <span className='font-medium'>•</span>{" "}
                        Generated: {" "}
                        {new Date(caseItem.created_at).toLocaleDateString('en-US')}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default CaseCard;

