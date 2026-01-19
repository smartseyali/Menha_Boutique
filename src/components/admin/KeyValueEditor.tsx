"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Form, Button, Table } from 'react-bootstrap';

interface KeyValuePair {
  key: string;
  value: string;
}

interface KeyValueEditorProps {
  label?: string;
  value: any; // Can be object, string (JSON), or null
  onChange: (value: any) => void;
  placeholder?: string;
  helpText?: string;
}

const KeyValueEditor: React.FC<KeyValueEditorProps> = ({
  label = 'Key-Value Pairs',
  value,
  onChange,
  placeholder = 'Enter key-value pairs',
  helpText = 'Add key-value pairs to store structured data',
}) => {
  const [pairs, setPairs] = useState<KeyValuePair[]>([]);
  const valueRef = useRef<any>(value);
  const onChangeRef = useRef(onChange);

  // Keep refs up to date
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Helper function to serialize value for comparison
  const serializeValue = useCallback((val: any): string => {
    if (!val) return '';
    if (typeof val === 'string') return val.trim();
    if (typeof val === 'object') {
      try {
        return JSON.stringify(val);
      } catch {
        return '';
      }
    }
    return String(val);
  }, []);

  // Helper function to parse value to pairs
  const parseValueToPairs = useCallback((val: any): KeyValuePair[] => {
    if (!val) return [];

    try {
      let parsed: any = {};
      
      if (typeof val === 'string') {
        if (val.trim() === '') return [];
        parsed = JSON.parse(val);
      } else if (typeof val === 'object') {
        parsed = val;
      } else {
        return [];
      }

      return Object.entries(parsed).map(([key, value]) => ({
        key,
        value: typeof value === 'string' ? value : String(value),
      }));
    } catch (error) {
      console.warn('Error parsing value:', error);
      return [];
    }
  }, []);

  // Helper function to convert pairs to value
  const pairsToValue = useCallback((pairsArray: KeyValuePair[]): any => {
    const obj: any = {};
    pairsArray.forEach((pair) => {
      if (pair.key.trim() !== '') {
        obj[pair.key] = pair.value;
      }
    });
    return Object.keys(obj).length > 0 ? obj : null;
  }, []);

  // Update pairs when value prop changes (only if different)
  useEffect(() => {
    const currentSerialized = serializeValue(valueRef.current);
    const newSerialized = serializeValue(value);
    
    // Only update if the value actually changed
    if (currentSerialized !== newSerialized) {
      const newPairs = parseValueToPairs(value);
      setPairs(newPairs);
    }
  }, [value, serializeValue, parseValueToPairs]);

  // Handle user changes to pairs - update parent
  const handlePairsChange = useCallback((newPairs: KeyValuePair[]) => {
    setPairs(newPairs);
    
    // Convert to value object
    const newValue = pairsToValue(newPairs);
    const newValueSerialized = serializeValue(newValue);
    const currentValueSerialized = serializeValue(valueRef.current);
    
    // Only call onChange if the value actually changed
    if (newValueSerialized !== currentValueSerialized) {
      onChangeRef.current(newValue);
    }
  }, [pairsToValue, serializeValue]);

  const handleAddPair = () => {
    handlePairsChange([...pairs, { key: '', value: '' }]);
  };

  const handleRemovePair = (index: number) => {
    handlePairsChange(pairs.filter((_, i) => i !== index));
  };

  const handleKeyChange = (index: number, key: string) => {
    const newPairs = [...pairs];
    newPairs[index].key = key;
    handlePairsChange(newPairs);
  };

  const handleValueChange = (index: number, value: string) => {
    const newPairs = [...pairs];
    newPairs[index].value = value;
    handlePairsChange(newPairs);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newPairs = [...pairs];
    [newPairs[index - 1], newPairs[index]] = [newPairs[index], newPairs[index - 1]];
    handlePairsChange(newPairs);
  };

  const handleMoveDown = (index: number) => {
    if (index === pairs.length - 1) return;
    const newPairs = [...pairs];
    [newPairs[index], newPairs[index + 1]] = [newPairs[index + 1], newPairs[index]];
    handlePairsChange(newPairs);
  };

  return (
    <Form.Group className="mb-3">
      <Form.Label>{label}</Form.Label>
      
      {pairs.length > 0 && (
        <Table striped bordered hover size="sm" className="mb-3">
          <thead>
            <tr>
              <th style={{ width: '35%' }}>Key</th>
              <th style={{ width: '50%' }}>Value</th>
              <th style={{ width: '15%' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pairs.map((pair, index) => (
              <tr key={index}>
                <td>
                  <Form.Control
                    type="text"
                    value={pair.key}
                    onChange={(e) => handleKeyChange(index, e.target.value)}
                    placeholder="Enter key"
                  />
                </td>
                <td>
                  <Form.Control
                    type="text"
                    value={pair.value}
                    onChange={(e) => handleValueChange(index, e.target.value)}
                    placeholder="Enter value"
                  />
                </td>
                <td>
                  <div className="d-flex gap-1">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      title="Move up"
                    >
                      <i className="ri-arrow-up-line"></i>
                    </Button>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => handleMoveDown(index)}
                      disabled={index === pairs.length - 1}
                      title="Move down"
                    >
                      <i className="ri-arrow-down-line"></i>
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleRemovePair(index)}
                      title="Remove"
                    >
                      <i className="ri-delete-bin-line"></i>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <div className="d-flex gap-2 align-items-center">
        <Button
          variant="outline-primary"
          size="sm"
          onClick={handleAddPair}
        >
          <i className="ri-add-line me-1"></i>
          Add Key-Value Pair
        </Button>
        {pairs.length === 0 && (
          <span className="text-muted">No key-value pairs added yet</span>
        )}
      </div>

      {helpText && (
        <Form.Text className="text-muted">
          {helpText}
        </Form.Text>
      )}
    </Form.Group>
  );
};

export default KeyValueEditor;
