'use client';
import React, { forwardRef } from 'react';
import type { Evaluation, Client, BioimpedanceScale, BioimpedanceInBody, BioimpedanceOmron } from '@/lib/data';
import { User, BarChart, Activity, Droplet, Bone, Scale, Zap, HeartPulse, Percent } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';

type BioimpedanceReportProps = {
    client: Client;
    evaluations: Evaluation[];
    scaleType: BioimpedanceScale;
    inbodyFields: { block: string; fields: { key: keyof BioimpedanceInBody; label: string; unit: string }[] }[];
    omronFields: { key: keyof BioimpedanceOmron; label: string; unit: string }[];
};

const BioimpedanceReport = forwardRef<HTMLDivElement, BioimpedanceReportProps>(({ client, evaluations, scaleType }, ref) => {
    
    const mainEvaluation = evaluations[evaluations.length - 1]; // Use the latest evaluation for main data
    const historyEvaluations = evaluations.slice(-5); // Get last 5 for history

    const getInBodyData = (evaluation: Evaluation, key: keyof BioimpedanceInBody) => {
        return evaluation.bioimpedance.inbody?.[key] ?? '-';
    };

    const getOmronData = (evaluation: Evaluation, key: keyof BioimpedanceOmron) => {
        return evaluation.bioimpedance.omron?.[key] ?? '-';
    };
    
    const getData = (evaluation: Evaluation, key: string) => {
        if (scaleType === 'inbody') {
            return getInBodyData(evaluation, key as keyof BioimpedanceInBody);
        }
        if (scaleType === 'omron') {
            return getOmronData(evaluation, key as keyof BioimpedanceOmron);
        }
        return '-';
    };
    
    const bmi = getData(mainEvaluation, 'bmi');
    const getBmiClassification = (bmi?: number | string) => {
        if (!bmi || bmi === '-') return 'N/D';
        const bmiValue = typeof bmi === 'string' ? parseFloat(bmi) : bmi;
        if (bmiValue < 18.5) return 'Abaixo do peso';
        if (bmiValue < 24.9) return 'Peso normal';
        if (bmiValue < 29.9) return 'Sobrepeso';
        if (bmiValue < 34.9) return 'Obesidade Grau I';
        if (bmiValue < 39.9) return 'Obesidade Grau II';
        return 'Obesidade Grau III';
    };

    const fatPercentage = getData(mainEvaluation, 'bodyFatPercentage');
    const getFatClassification = (percentage?: number|string) => {
        if (percentage === undefined || percentage === '-') return 'N/D';
        const p = typeof percentage === 'string' ? parseFloat(percentage) : percentage;
        const gender = client.gender;
        if (gender === 'Feminino') {
            if (p < 20) return 'Atleta';
            if (p <= 24) return 'Bom';
            if (p <= 30) return 'Aceitável';
            return 'Obeso';
        } else {
            if (p < 12) return 'Atleta';
            if (p <= 16) return 'Bom';
            if (p <= 22) return 'Aceitável';
            return 'Obeso';
        }
    };
    
    const chartData = (key: keyof BioimpedanceInBody | keyof BioimpedanceOmron) => {
        return historyEvaluations.map((ev, i) => ({
            name: `${i+1}`,
            value: ev.bioimpedance[scaleType!]?.[key as any] as number ?? 0
        }))
    }

    const SectionTitle = ({ title, icon: Icon }: { title: string, icon: React.ElementType }) => (
        <div className="flex items-center gap-2 bg-gray-200 p-2 rounded-t-md">
            <Icon className="text-gray-600" size={20} />
            <h2 className="font-bold text-gray-700 text-sm uppercase">{title}</h2>
        </div>
    );
    
    const InfoBox = ({ label, value, unit, icon: Icon }: { label: string, value: any, unit: string, icon: React.ElementType }) => (
        <div className="flex items-center justify-between text-sm py-1">
            <div className="flex items-center gap-2">
                <Icon className="text-blue-500" size={16}/>
                <span>{label}</span>
            </div>
            <span className="font-bold">{value} <span className="text-gray-500">{unit}</span></span>
        </div>
    );


    return (
        <div ref={ref} className="p-10 font-sans bg-white text-gray-800 text-xs">
            <header className="text-center mb-6">
                <h1 className="text-2xl font-bold text-gray-700">RELATÓRIO DE BIOIMPEDÂNCIA</h1>
            </header>

            <section className="border border-gray-300 rounded-md p-3 mb-4">
                 <SectionTitle title="Dados Pessoais" icon={User} />
                 <div className="grid grid-cols-4 gap-4 p-3 text-sm">
                    <div><strong>Nome:</strong> {client.name}</div>
                    <div><strong>Idade:</strong> {client.age}</div>
                    <div><strong>Sexo:</strong> {client.gender}</div>
                    <div><strong>Data do exame:</strong> {new Date(mainEvaluation.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</div>
                </div>
            </section>

             <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="col-span-2 border border-gray-300 rounded-md p-3">
                    <SectionTitle title="Análise da Composição Corporal" icon={BarChart} />
                    <div className="p-2 space-y-1">
                        <InfoBox label="Peso Total" value={getData(mainEvaluation, 'totalBodyWeight') || getData(mainEvaluation, 'weight')} unit="kg" icon={Scale} />
                        <InfoBox label="Massa Muscular" value={getData(mainEvaluation, 'skeletalMuscleMass')} unit="kg" icon={Activity} />
                        <InfoBox label="Massa Gorda" value={getData(mainEvaluation, 'bodyFatMass')} unit="kg" icon={Zap} />
                        <InfoBox label="Peso Ósseo" value={getData(mainEvaluation, 'bodyMinerals')} unit="kg" icon={Bone} />
                        <InfoBox label="Quantidade de Água Total" value={getData(mainEvaluation, 'totalBodyWater')} unit="kg" icon={Droplet} />
                    </div>
                </div>
                 <div className="col-span-1 border border-gray-300 rounded-md p-3">
                    <SectionTitle title="Informações Adicionais" icon={HeartPulse} />
                    <div className="p-2 space-y-2 text-center">
                         <div className="text-sm">
                            <p className="text-gray-600">Idade Metabólica</p>
                            <p className="font-bold text-lg">{getData(mainEvaluation, 'metabolicAge')} <span className="text-sm font-normal">anos</span></p>
                        </div>
                        <div className="text-sm">
                            <p className="text-gray-600">Gordura Visceral</p>
                            <p className="font-bold text-lg">{getData(mainEvaluation, 'visceralFatLevel') || getData(mainEvaluation, 'visceralFatArea')} <span className="text-sm font-normal">{getData(mainEvaluation, 'visceralFatLevel') ? 'nível' : 'cm²'}</span></p>
                        </div>
                        <div className="text-sm">
                            <p className="text-gray-600">Gasto Calórico Total</p>
                            <p className="font-bold text-lg">{getData(mainEvaluation, 'basalMetabolicRate')} <span className="text-sm font-normal">kcal</span></p>
                        </div>
                    </div>
                </div>
            </div>

            <section className="border border-gray-300 rounded-md p-3 mb-4">
                <SectionTitle title="Análise de Músculo e Gordura" icon={Activity} />
                <div className="flex justify-around p-4">
                     <div className="text-center">
                        <p className="text-gray-600">PESO (KG)</p>
                        <p className="font-bold text-xl">{getData(mainEvaluation, 'totalBodyWeight') || getData(mainEvaluation, 'weight')}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-gray-600">MASSA MAGRA (KG)</p>
                        <p className="font-bold text-xl">{getData(mainEvaluation, 'fatFreeMass') || getData(mainEvaluation, 'leanBodyMass')}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-gray-600">MASSA GORDA (KG)</p>
                        <p className="font-bold text-xl">{getData(mainEvaluation, 'bodyFatMass')}</p>
                    </div>
                </div>
            </section>

             <section className="border border-gray-300 rounded-md p-3 mb-4">
                <SectionTitle title="Análise de Obesidade" icon={Percent} />
                <table className="w-full mt-2">
                    <thead>
                        <tr className="text-left">
                            <th className="font-normal text-gray-600 p-2 w-1/3"></th>
                            <th className="font-normal text-gray-600 p-2 w-1/3 text-center">VALOR</th>
                            <th className="font-normal text-gray-600 p-2 w-1/3 text-center">CLASSIFICAÇÃO</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-t">
                            <td className="p-2 font-bold">IMC</td>
                            <td className="p-2 text-center font-bold border rounded-md m-1 bg-blue-100 text-blue-800">{typeof bmi === 'number' ? bmi.toFixed(2) : bmi}</td>
                            <td className="p-2 text-center font-bold">{getBmiClassification(bmi as number)}</td>
                        </tr>
                        <tr className="border-t">
                            <td className="p-2 font-bold">PERCENTUAL DE GORDURA</td>
                            <td className="p-2 text-center font-bold border rounded-md m-1 bg-blue-100 text-blue-800">{typeof fatPercentage === 'number' ? fatPercentage.toFixed(2) : fatPercentage}%</td>
                            <td className="p-2 text-center font-bold">{getFatClassification(fatPercentage as number)}</td>
                        </tr>
                    </tbody>
                </table>
            </section>
            
            {scaleType === 'inbody' && (
            <section className="border border-gray-300 rounded-md p-3 mb-4">
                 <SectionTitle title="Distribuição dos Tecidos" icon={BarChart} />
                 <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="text-center">
                        <h3 className="font-bold mb-2">ANÁLISE MASSA MAGRA SEGMENTAR %</h3>
                         <div className="relative w-24 h-48 mx-auto">
                            <img src="https://firebasestudio.ai/public-hosting/projects/2654/assets/4042/body-model.png" alt="Body model" className="w-full h-full object-contain" />
                            <div className="absolute top-[15%] left-[50%]" style={{transform: 'translateX(-50%)'}}>{getInBodyData(mainEvaluation, 'trunkLeanMass')}kg</div>
                            <div className="absolute top-[25%] left-0">{getInBodyData(mainEvaluation, 'leftArmLeanMass')}kg</div>
                            <div className="absolute top-[25%] right-0">{getInBodyData(mainEvaluation, 'rightArmLeanMass')}kg</div>
                            <div className="absolute top-[60%] left-[20%]">{getInBodyData(mainEvaluation, 'leftLegLeanMass')}kg</div>
                            <div className="absolute top-[60%] right-[20%]">{getInBodyData(mainEvaluation, 'rightLegLeanMass')}kg</div>
                         </div>
                    </div>
                     <div className="text-center">
                        <h3 className="font-bold mb-2">ANÁLISE MASSA GORDA SEGMENTAR %</h3>
                         <div className="relative w-24 h-48 mx-auto">
                            <img src="https://firebasestudio.ai/public-hosting/projects/2654/assets/4042/body-model.png" alt="Body model" className="w-full h-full object-contain" />
                            <div className="absolute top-[15%] left-[50%]" style={{transform: 'translateX(-50%)'}}>{getInBodyData(mainEvaluation, 'trunkFat')}kg</div>
                            <div className="absolute top-[25%] left-0">{getInBodyData(mainEvaluation, 'leftArmFat')}kg</div>
                            <div className="absolute top-[25%] right-0">{getInBodyData(mainEvaluation, 'rightArmFat')}kg</div>
                            <div className="absolute top-[60%] left-[20%]">{getInBodyData(mainEvaluation, 'leftLegFat')}kg</div>
                            <div className="absolute top-[60%] right-[20%]">{getInBodyData(mainEvaluation, 'rightLegFat')}kg</div>
                         </div>
                    </div>
                 </div>
            </section>
            )}

            <section className="space-y-4">
                <div className="border border-gray-300 rounded-md p-3">
                    <h3 className="font-bold text-center mb-2">PESO (KG)</h3>
                    <ResponsiveContainer width="100%" height={100}>
                        <LineChart data={chartData(scaleType === 'inbody' ? 'totalBodyWeight' : 'weight')}>
                            <XAxis dataKey="name" stroke="#888888" fontSize={12} />
                            <YAxis stroke="#888888" fontSize={12} />
                            <Tooltip />
                            <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                 <div className="border border-gray-300 rounded-md p-3">
                    <h3 className="font-bold text-center mb-2">MASSA MAGRA (KG)</h3>
                     <ResponsiveContainer width="100%" height={100}>
                        <LineChart data={chartData(scaleType === 'inbody' ? 'fatFreeMass' : 'leanBodyMass')}>
                            <XAxis dataKey="name" stroke="#888888" fontSize={12} />
                            <YAxis stroke="#888888" fontSize={12} />
                            <Tooltip />
                            <Line type="monotone" dataKey="value" stroke="#84cc16" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                 <div className="border border-gray-300 rounded-md p-3">
                    <h3 className="font-bold text-center mb-2">MASSA GORDA (%)</h3>
                    <ResponsiveContainer width="100%" height={100}>
                        <LineChart data={chartData('bodyFatPercentage')}>
                            <XAxis dataKey="name" stroke="#888888" fontSize={12} />
                            <YAxis stroke="#888888" fontSize={12} />
                            <Tooltip />
                            <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </section>

             <footer className="mt-8 text-center text-xs text-gray-500">
                Relatório gerado por Alpha Trainer - {new Date().toLocaleDateString('pt-BR')}
            </footer>
        </div>
    );
});

BioimpedanceReport.displayName = "BioimpedanceReport";
export default BioimpedanceReport;

    