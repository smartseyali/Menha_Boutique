"use client";

import React, { useState, useEffect } from 'react';
import { Row, Col, Table, Button, Form, Modal, Card, Badge, Tab, Tabs } from 'react-bootstrap';
import { adminApi } from '@/utils/adminApi';
import { showSuccessToast, showErrorToast } from '../toast-popup/Toastify';

interface Tariff {
    id: string;
    max_weight: number;
    tariff_type: 'WEIGHT' | 'VOLUME';
    prices: {
        TN: number;
        SOUTH: number;
        NE: number;
        REST: number;
        [key: string]: number;
    };
}

interface State {
    id: string;
    name: string;
    zone: string;
}

const ZONES = ['TN', 'SOUTH', 'NE', 'REST'];

const DeliveryTab = () => {
    const [tariffs, setTariffs] = useState<Tariff[]>([]);
    const [states, setStates] = useState<State[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTariffType, setActiveTariffType] = useState<'WEIGHT' | 'VOLUME'>('WEIGHT');

    // Modal States
    const [showTariffModal, setShowTariffModal] = useState(false);
    const [editingTariff, setEditingTariff] = useState<Tariff | null>(null);
    const [tariffForm, setTariffForm] = useState({
        max_weight: '',
        tariff_type: 'WEIGHT', // Initialize as string, but logically typed
        prices: { TN: 0, SOUTH: 0, NE: 0, REST: 0 }
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data:any = await adminApi.getDeliveryCharges();
            
            if (data.tariffs && data.states) {
                setTariffs(data.tariffs);
                setStates(data.states);
            } else {
                setTariffs([]);
                setStates([]); 
            }
        } catch (error: any) {
            console.error('Error fetching data:', error);
            showErrorToast('Failed to load delivery data');
        } finally {
            setLoading(false);
        }
    };

    // --- Tariff Handlers ---

    const handleAddTariff = () => {
        setEditingTariff(null);
        setTariffForm({
            max_weight: '',
            tariff_type: activeTariffType, // Default to current tab
            prices: { TN: 0, SOUTH: 0, NE: 0, REST: 0 }
        });
        setShowTariffModal(true);
    };

    const handleEditTariff = (tariff: Tariff) => {
        setEditingTariff(tariff);
        setTariffForm({
            max_weight: tariff.max_weight.toString(),
            tariff_type: tariff.tariff_type || 'WEIGHT',
            prices: { ...tariff.prices }
        });
        setShowTariffModal(true);
    };

    const handleDeleteTariff = async (id: string) => {
        if (!window.confirm('Delete this tariff slab?')) return;
        try {
            await adminApi.deleteTariff(id);
            showSuccessToast('Tariff deleted');
            fetchData();
        } catch (error: any) {
            showErrorToast(error.message);
        }
    };

    const handleTariffSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                max_weight: parseInt(tariffForm.max_weight),
                tariff_type: tariffForm.tariff_type,
                prices: tariffForm.prices
            };

            if (editingTariff) {
                await adminApi.updateTariff(editingTariff.id, payload);
                showSuccessToast('Tariff updated');
            } else {
                await adminApi.createTariff(payload);
                showSuccessToast('Tariff created');
            }
            setShowTariffModal(false);
            fetchData();
        } catch (error: any) {
            showErrorToast(error.message);
        }
    };

    const handlePriceChange = (zone: string, value: string) => {
        setTariffForm(prev => ({
            ...prev,
            prices: {
                ...prev.prices,
                [zone]: parseFloat(value) || 0
            }
        }));
    };

    // --- State Zone Handlers ---

    const handleZoneChange = async (stateId: string, newZone: string) => {
        try {
            // Optimistic update
            setStates(prev => prev.map(s => s.id === stateId ? { ...s, zone: newZone } : s));
            
            await adminApi.updateStateZone(stateId, newZone);
            showSuccessToast('Zone updated');
        } catch (error: any) {
             showErrorToast('Failed to update zone');
             fetchData(); // Revert on error
        }
    };

    const filteredStates = states.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredTariffs = tariffs.filter(t => (t.tariff_type || 'WEIGHT') === activeTariffType);

    return (
        <div className="bb-admin-delivery">
            <Tabs defaultActiveKey="tariffs" className="mb-4">
                <Tab eventKey="tariffs" title="Tariff Slabs">
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-white border-0 py-3 d-flex justify-content-between align-items-center flex-wrap gap-3">
                            <div>
                                <h5 className="mb-0">Delivery Tariffs</h5>
                                <small className="text-muted">Define pricing based on weight/volume and zones</small>
                            </div>
                            <div className="d-flex gap-2">
                                <div className="btn-group" role="group">
                                    <button 
                                        type="button" 
                                        className={`btn btn-sm ${activeTariffType === 'WEIGHT' ? 'btn-primary' : 'btn-outline-primary'}`}
                                        onClick={() => setActiveTariffType('WEIGHT')}
                                    >
                                        Weight (Grams)
                                    </button>
                                    <button 
                                        type="button" 
                                        className={`btn btn-sm ${activeTariffType === 'VOLUME' ? 'btn-primary' : 'btn-outline-primary'}`}
                                        onClick={() => setActiveTariffType('VOLUME')}
                                    >
                                        Volume (ML)
                                    </button>
                                </div>
                                <Button onClick={handleAddTariff} variant="success" size="sm">
                                    <i className="ri-add-line"></i> Add Slab
                                </Button>
                            </div>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <Table responsive hover className="mb-0 align-middle">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="ps-4">Max {activeTariffType === 'WEIGHT' ? 'Weight (g)' : 'Volume (ml)'}</th>
                                        <th>TN Price</th>
                                        <th>South Price</th>
                                        <th>North East Price</th>
                                        <th>Rest of India</th>
                                        <th className="text-end pe-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTariffs.length === 0 ? (
                                        <tr><td colSpan={6} className="text-center py-4 text-muted">No tariffs found for {activeTariffType}.</td></tr>
                                    ) : (
                                        filteredTariffs.map(t => (
                                            <tr key={t.id}>
                                                <td className="ps-4 fw-bold">{t.max_weight}{activeTariffType === 'WEIGHT' ? 'g' : 'ml'}</td>
                                                <td>₹{t.prices?.TN || 0}</td>
                                                <td>₹{t.prices?.SOUTH || 0}</td>
                                                <td>₹{t.prices?.NE || 0}</td>
                                                <td>₹{t.prices?.REST || 0}</td>
                                                <td className="text-end pe-4">
                                                    <Button variant="light" size="sm" className="me-2 text-primary" onClick={() => handleEditTariff(t)}>
                                                        <i className="ri-edit-line"></i>
                                                    </Button>
                                                    <Button variant="light" size="sm" className="text-danger" onClick={() => handleDeleteTariff(t.id)}>
                                                        <i className="ri-delete-bin-line"></i>
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Tab>

                <Tab eventKey="zones" title="State Zones">
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-white border-0 py-3">
                            <Row className="align-items-center">
                                <Col>
                                    <h5 className="mb-0">Zone Configuration</h5>
                                    <small className="text-muted">Assign states to specific pricing zones</small>
                                </Col>
                                <Col md={4}>
                                    <Form.Control 
                                        type="search" 
                                        placeholder="Search states..." 
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </Col>
                            </Row>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                                <Table responsive hover className="mb-0 align-middle">
                                    <thead className="bg-light sticky-top">
                                        <tr>
                                            <th className="ps-4">State Name</th>
                                            <th>Zone Assignment</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredStates.map(state => (
                                            <tr key={state.id}>
                                                <td className="ps-4">{state.name}</td>
                                                <td>
                                                    <Form.Select 
                                                        size="sm" 
                                                        value={state.zone} 
                                                        onChange={(e) => handleZoneChange(state.id, e.target.value)}
                                                        style={{ maxWidth: '200px' }}
                                                    >
                                                        {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
                                                    </Form.Select>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        </Card.Body>
                    </Card>
                </Tab>
            </Tabs>

            {/* Tariff Modal */}
            <Modal show={showTariffModal} onHide={() => setShowTariffModal(false)} centered backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>{editingTariff ? 'Edit Tariff Slab' : 'Add Tariff Slab'}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleTariffSubmit}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Tariff Type</Form.Label>
                            <Form.Select 
                                value={tariffForm.tariff_type}
                                onChange={(e) => setTariffForm({...tariffForm, tariff_type: e.target.value})}
                            >
                                <option value="WEIGHT">Weight (Grams)</option>
                                <option value="VOLUME">Volume (ML)</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Max {tariffForm.tariff_type === 'WEIGHT' ? 'Weight (grams)' : 'Volume (ml)'}</Form.Label>
                            <Form.Control 
                                type="number" 
                                value={tariffForm.max_weight}
                                onChange={(e) => setTariffForm({...tariffForm, max_weight: e.target.value})}
                                placeholder={tariffForm.tariff_type === 'WEIGHT' ? 'e.g. 1000' : 'e.g. 500'}
                                required 
                            />
                            <Form.Text className="text-muted">
                                Prices apply for {tariffForm.tariff_type === 'WEIGHT' ? 'weights' : 'volumes'} up to this amount.
                            </Form.Text>
                        </Form.Group>
                        
                        <h6 className="mb-3 mt-4">Zone Prices (₹)</h6>
                        <Row>
                            {ZONES.map(zone => (
                                <Col xs={6} key={zone} className="mb-3">
                                    <Form.Group>
                                        <Form.Label>{zone} Zone</Form.Label>
                                        <Form.Control 
                                            type="number" 
                                            value={tariffForm.prices[zone as keyof typeof tariffForm.prices]}
                                            onChange={(e) => handlePriceChange(zone, e.target.value)}
                                            step="0.01"
                                            required 
                                        />
                                    </Form.Group>
                                </Col>
                            ))}
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="light" onClick={() => setShowTariffModal(false)}>Cancel</Button>
                        <Button type="submit" variant="primary">Save Config</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default DeliveryTab;
