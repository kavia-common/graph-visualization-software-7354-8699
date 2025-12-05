import React from 'react';
import { useGraphStore } from '../store/graphStore';
import { updateNode } from '../services/api';
import { toast } from '../utils/toast';

export default function RightPropertiesPanel() {
  const selectedId = useGraphStore((s) => s.selectedId);
  const node = useGraphStore((s) => s.nodes.find((n) => n.id === s.selectedId));
  const updateNodeLocal = useGraphStore((s) => s.updateNode);

  const [form, setForm] = React.useState(null);
  React.useEffect(() => {
    if (node) {
      setForm({
        label: node.label || '',
        type: node.type || '',
        props: { ...(node.props || {}) },
      });
    } else {
      setForm(null);
    }
  }, [node?.id]);

  if (!node) {
    return (
      <aside
        aria-label="Properties"
        style={{
          width: 280,
          borderLeft: '1px solid #e5e7eb',
          padding: 12,
          background: '#fafafa',
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 14 }}>Properties</div>
        <div style={{ color: '#6b7280', fontSize: 13 }}>Select a node to edit its properties.</div>
      </aside>
    );
  }

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const setProp = (k, v) => {
    setForm((prev) => ({ ...prev, props: { ...(prev.props || {}), [k]: v } }));
  };

  const onSave = async (e) => {
    e.preventDefault();
    // Basic validation
    if (!form.label || !form.type) {
      toast('Label and Type are required.', 'warning');
      return;
    }
    const patch = { label: form.label, type: form.type, props: form.props };
    const prev = { label: node.label, type: node.type, props: node.props };
    // optimistic
    updateNodeLocal(node.id, patch);
    try {
      await updateNode(node.id, patch);
      toast('Saved.', 'success');
    } catch (err) {
      if (err && !err.isNetwork && err.status !== 404) {
        toast('Failed to save to backend, rolling back.', 'error');
        updateNodeLocal(node.id, prev);
        setForm(prev);
      } else {
        toast('Backend unavailable; changes kept locally.', 'warn');
      }
    }
  };

  return (
    <aside
      aria-label="Properties"
      style={{
        width: 280,
        borderLeft: '1px solid #e5e7eb',
        padding: 12,
        background: '#fafafa',
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 14 }}>Properties</div>
      <form onSubmit={onSave} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={{ fontSize: 12 }}>
          Label
          <input
            type="text"
            value={form.label}
            onChange={(e) => setField('label', e.target.value)}
            style={{ width: '100%', padding: 6, border: '1px solid #d1d5db', borderRadius: 4 }}
            required
          />
        </label>
        <label style={{ fontSize: 12 }}>
          Type
          <input
            type="text"
            value={form.type}
            onChange={(e) => setField('type', e.target.value)}
            style={{ width: '100%', padding: 6, border: '1px solid #d1d5db', borderRadius: 4 }}
            required
          />
        </label>
        {/* Example dynamic props fields: show simple key-value editor for common props */}
        <fieldset style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: 8 }}>
          <legend style={{ fontSize: 12, color: '#374151' }}>Props</legend>
          <label style={{ fontSize: 12 }}>
            IP
            <input
              type="text"
              value={form.props?.ip || ''}
              onChange={(e) => setProp('ip', e.target.value)}
              placeholder="e.g., 192.168.0.1"
              style={{ width: '100%', padding: 6, border: '1px solid #d1d5db', borderRadius: 4 }}
            />
          </label>
          <label style={{ fontSize: 12 }}>
            Model
            <input
              type="text"
              value={form.props?.model || ''}
              onChange={(e) => setProp('model', e.target.value)}
              placeholder="e.g., XR500"
              style={{ width: '100%', padding: 6, border: '1px solid #d1d5db', borderRadius: 4 }}
            />
          </label>
        </fieldset>

        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          <button type="submit" style={{ padding: '6px 10px', background: '#2563eb', color: 'white', border: 0, borderRadius: 4 }}>
            Save
          </button>
        </div>
      </form>
    </aside>
  );
}
