import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge, Modal, Form, Spinner, Row, Col } from 'react-bootstrap';
import { authApi } from '../../utils/authApi';

interface Gateway {
  _id: string;
  name: string;
  type: string;
  isActive: boolean;
  isTestMode: boolean;
  credentials: any;
}

const PaymentSettingsTab = () => {
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingGateway, setEditingGateway] = useState<Gateway | null>(null);

  // Form State
  const [name, setName] = useState('razorpay');
  const [isTestMode, setIsTestMode] = useState(true);
  const [credentials, setCredentials] = useState<any>({});

  useEffect(() => {
    fetchGateways();
  }, []);

  const fetchGateways = async () => {
    setLoading(true);
    try {
      const data = await authApi.getPaymentGateways();
      setGateways(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Failed to load gateways');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (gateway: Gateway) => {
    setEditingGateway(gateway);
    setName(gateway.name);
    setIsTestMode(gateway.isTestMode);
    setCredentials(gateway.credentials || {});
    setShowModal(true);
  };

  const handleAddNew = () => {
    setEditingGateway(null);
    setName('razorpay');
    setIsTestMode(true);
    setCredentials({});
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        name,
        type: 'payment_gateway',
        isTestMode,
        credentials,
        isActive: editingGateway ? editingGateway.isActive : false // default inactive
      };

      if (editingGateway) {
        await authApi.updatePaymentGateway(editingGateway._id, payload);
      } else {
        await authApi.createPaymentGateway(payload);
      }
      setShowModal(false);
      fetchGateways();
    } catch (err: any) {
       alert(err.message || 'Failed to save');
    }
  };

  const toggleActive = async (gateway: Gateway) => {
    if (gateway.isActive) return; // Already active
    if (!window.confirm(`Activate ${gateway.name}? This will deactivate other gateways.`)) return;

    try {
      await authApi.updatePaymentGateway(gateway._id, { isActive: true });
      fetchGateways();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const updateCredentialField = (key: string, value: string) => {
    setCredentials((prev: any) => ({ ...prev, [key]: value }));
  };

  const renderCredentialFields = () => {
    if (name === 'razorpay') {
      return (
        <>
          <Form.Group className="mb-3">
             <Form.Label>Key ID</Form.Label>
             <Form.Control 
                type="text" 
                value={credentials.keyId || ''} 
                onChange={(e) => updateCredentialField('keyId', e.target.value)}
             />
          </Form.Group>
          <Form.Group className="mb-3">
             <Form.Label>Key Secret</Form.Label>
             <Form.Control 
                type="password" 
                value={credentials.keySecret || ''} 
                onChange={(e) => updateCredentialField('keySecret', e.target.value)}
             />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Webhook Secret</Form.Label>
            <Form.Control 
               type="password" 
               value={credentials.webhookSecret || ''} 
               onChange={(e) => updateCredentialField('webhookSecret', e.target.value)}
            />
         </Form.Group>
        </>
      );
    } 
    else if (name === 'phonepe') {
      return (
        <>
           <Form.Group className="mb-3">
             <Form.Label>Merchant ID</Form.Label>
             <Form.Control 
                type="text" 
                value={credentials.merchantId || ''} 
                onChange={(e) => updateCredentialField('merchantId', e.target.value)}
             />
          </Form.Group>
          <Form.Group className="mb-3">
             <Form.Label>Salt Key</Form.Label>
             <Form.Control 
                type="password" 
                value={credentials.saltKey || ''} 
                onChange={(e) => updateCredentialField('saltKey', e.target.value)}
             />
          </Form.Group>
           <Form.Group className="mb-3">
             <Form.Label>Salt Index</Form.Label>
             <Form.Control 
                type="text" 
                value={credentials.saltIndex || '1'} 
                onChange={(e) => updateCredentialField('saltIndex', e.target.value)}
             />
          </Form.Group>
          <Form.Group className="mb-3">
             <Form.Label>Base URL</Form.Label>
             <Form.Select 
                value={credentials.baseUrl || 'https://api-preprod.phonepe.com/apis/pg-sandbox'} 
                onChange={(e) => updateCredentialField('baseUrl', e.target.value)}
             >
                <option value="https://api-preprod.phonepe.com/apis/pg-sandbox">Sandbox (Preprod)</option>
                <option value="https://api.phonepe.com/apis/hermes">Production</option>
             </Form.Select>
          </Form.Group>
        </>
      )
    } else if (name === 'paytm') {
      return (
        <>
           <Form.Group className="mb-3">
             <Form.Label>Merchant ID (MID)</Form.Label>
             <Form.Control type="text" value={credentials.mid || ''} onChange={(e) => updateCredentialField('mid', e.target.value)} />
           </Form.Group>
           <Form.Group className="mb-3">
             <Form.Label>Merchant Key</Form.Label>
             <Form.Control type="password" value={credentials.mkey || ''} onChange={(e) => updateCredentialField('mkey', e.target.value)} />
           </Form.Group>
           <Form.Group className="mb-3">
             <Form.Label>Website</Form.Label>
             <Form.Control type="text" value={credentials.website || 'WEBSTAGING'} onChange={(e) => updateCredentialField('website', e.target.value)} />
           </Form.Group>
        </>
      )
    } else if (name === 'cashfree') {
      return (
        <>
            <Form.Group className="mb-3">
             <Form.Label>App ID</Form.Label>
             <Form.Control type="text" value={credentials.appId || ''} onChange={(e) => updateCredentialField('appId', e.target.value)} />
           </Form.Group>
           <Form.Group className="mb-3">
             <Form.Label>Secret Key</Form.Label>
             <Form.Control type="password" value={credentials.secretKey || ''} onChange={(e) => updateCredentialField('secretKey', e.target.value)} />
           </Form.Group>
        </>
      )
    } else if (name === 'instamojo') {
      return (
        <>
           <Form.Group className="mb-3">
             <Form.Label>API Key</Form.Label>
             <Form.Control type="text" value={credentials.apiKey || ''} onChange={(e) => updateCredentialField('apiKey', e.target.value)} />
           </Form.Group>
           <Form.Group className="mb-3">
             <Form.Label>Auth Token</Form.Label>
             <Form.Control type="password" value={credentials.authToken || ''} onChange={(e) => updateCredentialField('authToken', e.target.value)} />
           </Form.Group>
           <Form.Group className="mb-3">
             <Form.Label>Salt / Private Salt</Form.Label>
             <Form.Control type="password" value={credentials.salt || ''} onChange={(e) => updateCredentialField('salt', e.target.value)} />
           </Form.Group>
        </>
      )
    } else if (name === 'ccavenue') {
      return (
        <>
           <Form.Group className="mb-3">
             <Form.Label>Merchant ID</Form.Label>
             <Form.Control type="text" value={credentials.merchantId || ''} onChange={(e) => updateCredentialField('merchantId', e.target.value)} />
           </Form.Group>
           <Form.Group className="mb-3">
             <Form.Label>Access Code</Form.Label>
             <Form.Control type="text" value={credentials.accessCode || ''} onChange={(e) => updateCredentialField('accessCode', e.target.value)} />
           </Form.Group>
           <Form.Group className="mb-3">
             <Form.Label>Working Key</Form.Label>
             <Form.Control type="password" value={credentials.workingKey || ''} onChange={(e) => updateCredentialField('workingKey', e.target.value)} />
           </Form.Group>
        </>
      )
    }
    return (
      <Form.Group className="mb-3">
         <Form.Label>Credentials (JSON)</Form.Label>
         <Form.Control 
            as="textarea"
            rows={4}
            value={JSON.stringify(credentials, null, 2)}
            onChange={(e) => {
               try {
                 const parsed = JSON.parse(e.target.value);
                 setCredentials(parsed);
               } catch(err) {
                 // ignore parse error while typing
               }
            }}
         />
      </Form.Group>
    );
  };

  return (
    <Card className="shadow-sm border-0">
      <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center">
        <h5 className="mb-0 fw-bold">Payment Gateways</h5>
        <Button variant="primary" size="sm" onClick={handleAddNew}>
          <i className="ri-add-line me-1"></i> Add Gateway
        </Button>
      </Card.Header>
      <Card.Body>
        {loading ? (
             <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
        ) : (
            <div className="table-responsive">
               <Table hover className="align-middle">
                 <thead className="bg-light">
                   <tr>
                     <th>Name</th>
                     <th>Mode</th>
                     <th>Status</th>
                     <th>Last Updated</th>
                     <th className="text-end">Actions</th>
                   </tr>
                 </thead>
                 <tbody>
                    {gateways.length === 0 ? (
                        <tr><td colSpan={5} className="text-center py-4">No gateways configured.</td></tr>
                    ) : gateways.map(g => (
                        <tr key={g._id}>
                           <td className="fw-semibold text-capitalize">{g.name}</td>
                           <td>
                             {g.isTestMode ? <Badge bg="warning" text="dark">Test</Badge> : <Badge bg="success">Live</Badge>}
                           </td>
                           <td>
                              <Form.Check 
                                type="switch"
                                checked={g.isActive}
                                onChange={() => toggleActive(g)}
                                label={g.isActive ? 'Active' : 'Inactive'}
                                className={g.isActive ? 'text-success fw-bold' : 'text-muted'}
                              />
                           </td>
                           <td className="text-muted small">
                               {/* g.updatedAt */}
                               Today
                           </td>
                           <td className="text-end">
                              <Button variant="light" size="sm" className="me-2 text-primary" onClick={() => handleEdit(g)}>
                                <i className="ri-pencil-line"></i> Check Config
                              </Button>
                           </td>
                        </tr>
                    ))}
                 </tbody>
               </Table>
            </div>
        )}
      </Card.Body>

      {/* Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} backdrop="static" centered>
         <Modal.Header closeButton>
            <Modal.Title>{editingGateway ? 'Edit Gateway' : 'Add Gateway'}</Modal.Title>
         </Modal.Header>
         <Modal.Body>
             <Form>
                <Row>
                   <Col>
                      <Form.Group className="mb-3">
                         <Form.Label>Provider</Form.Label>
                          <Form.Select 
                           value={name} 
                           onChange={(e) => setName(e.target.value)}
                           disabled={!!editingGateway} // Don't change provider type on edit to avoid confusion? Or allow it.
                         >
                            <option value="razorpay">Razorpay</option>
                            <option value="phonepe">PhonePe</option>
                            <option value="paytm">Paytm</option>
                            <option value="cashfree">Cashfree</option>
                            <option value="instamojo">Instamojo</option>
                            <option value="ccavenue">CCAvenue</option>
                            <option value="stripe">Stripe</option>
                            <option value="paypal">PayPal</option>
                         </Form.Select>
                      </Form.Group>
                   </Col>
                   <Col>
                      <Form.Group className="mb-3">
                         <Form.Label>Mode</Form.Label>
                         <Form.Check 
                           type="switch"
                           label={isTestMode ? "Test / Sandbox" : "Live / Production"}
                           checked={isTestMode}
                           onChange={(e) => setIsTestMode(e.target.checked)}
                           className="mt-2"
                         />
                      </Form.Group>
                   </Col>
                </Row>

                <hr className="my-3"/>
                <h6 className="mb-3">Credentials</h6>
                {renderCredentialFields()}

             </Form>
         </Modal.Body>
         <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave}>Save Changes</Button>
         </Modal.Footer>
      </Modal>
    </Card>
  );
};

export default PaymentSettingsTab;
