import React, { useState, useRef, useEffect } from 'react';
import { usePreferencesStore, ResumeProfile } from '../store/usePreferencesStore';
import { MapPin, Clock, Award, FileText, Settings2, ShieldCheck } from 'lucide-react';
import { Title, Text, TextInput, NumberInput, Switch, Box, Flex, Paper, Accordion, Select, Textarea, Button, Badge, Group, SimpleGrid } from '@mantine/core';
import { AppPage, PageHeader } from '../components/layout/AppPage';
import { mobileContentInset, mobileSurfacePadding } from '../layout';

function ResumeProfileEditor({ 
  profile, 
  onSave 
}: { 
  key?: React.Key;
  profile: ResumeProfile; 
  onSave: (p: ResumeProfile) => void; 
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<ResumeProfile>(profile);

  useEffect(() => {
    if (!isEditing) setDraft(profile);
  }, [profile, isEditing]);

  const handleCancel = () => {
    setDraft(profile);
    setIsEditing(false);
  };

  const handleSave = () => {
    onSave(draft);
    setIsEditing(false);
  };

  return (
    <Box>
      {!isEditing ? (
	         <Box pt="sm">
	            <Box p="md" bg="surface.1" style={{ border: '1px solid var(--mantine-color-sage-2)', borderRadius: 'var(--mantine-radius-md)', fontFamily: 'monospace', fontSize: '0.8rem', whiteSpace: 'pre-wrap', maxHeight: '160px', overflowY: 'auto' }}>
	              {profile.resumeText || <Text fs="italic" c="sage.6" size="xs">No resume text provided.</Text>}
	            </Box>
            {profile.notes && (
              <Box mt="md">
                <Text size="sm" fw={700} c="ink.9">Notes:</Text>
                <Text size="sm" c="ink.7">{profile.notes}</Text>
              </Box>
            )}
	            <Flex justify="flex-end" mt="md">
	              <Button size="sm" radius="md" variant="outline" color="sage.8" onClick={() => setIsEditing(true)}>Edit Profile</Button>
	            </Flex>
         </Box>
      ) : (
         <Box pt="md" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
           <TextInput 
             label="Profile Name"
             size="md"
             value={draft.title}
             onChange={e => setDraft({...draft, title: e.target.value})}
           />
           
           <Group align="flex-end">
             <Select
               label="Target Lane"
               size="md"
               value={draft.targetLane}
               onChange={val => setDraft({...draft, targetLane: val as any})}
               data={[
                 { value: 'kitchen', label: 'Kitchen' },
                 { value: 'warehouse', label: 'Warehouse' },
                 { value: 'general', label: 'General / Quick Win' }
               ]}
               style={{ flex: 1 }}
             />
             <Switch 
               label="Default for lane" 
               checked={draft.isDefaultForLane} 
               onChange={e => setDraft({...draft, isDefaultForLane: e.currentTarget.checked})} 
               mb={8}
               color="lime"
             />
           </Group>

           <Textarea 
             label="Resume / CV Content"
             size="md"
             minRows={5}
             autosize
             value={draft.resumeText}
             onChange={e => setDraft({...draft, resumeText: e.target.value})}
             placeholder="Paste your plain-text resume here..."
             styles={{ input: { fontFamily: 'monospace', fontSize: '0.75rem' } }}
           />
           
           <Textarea 
             label="Additional Notes (Optional)"
             size="md"
             minRows={2}
             autosize
             value={draft.notes}
             onChange={e => setDraft({...draft, notes: e.target.value})}
             placeholder="E.g., I have 6 months experience operating a pump truck."
           />

	           <Flex justify="flex-end" gap="sm" mt="md">
	             <Button size="md" radius="md" variant="default" onClick={handleCancel}>Cancel</Button>
	             <Button size="md" radius="md" color="ink" onClick={handleSave}>Save Changes</Button>
	           </Flex>
         </Box>
      )}
    </Box>
  );
}

export function Preferences() {
  const { preferences, updatePreferences } = usePreferencesStore();
  const [localPrefs, setLocalPrefs] = useState(preferences);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerAutoSave = (newPrefs: any) => {
    setSaveStatus('saving');
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      updatePreferences(newPrefs);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 600);
  };

  const updateLocal = (key: string, value: any) => {
    setLocalPrefs(prev => {
      const next = { ...prev, [key]: value };
      triggerAutoSave(next);
      return next;
    });
  };

  const updateNested = (category: string, key: string, value: any) => {
    setLocalPrefs(prev => {
      const next = {
        ...prev,
        [category]: {
          ...(prev as any)[category],
          [key]: value
        }
      };
      triggerAutoSave(next);
      return next;
    });
  };

  const handleSaveProfile = (updatedProfile: ResumeProfile) => {
    setSaveStatus('saving');
    setLocalPrefs(prev => {
      const newProfiles = [...prev.resumeProfiles];
      const idx = newProfiles.findIndex(p => p.id === updatedProfile.id);
      if (idx === -1) return prev;
      
      const p = { ...updatedProfile, lastUpdated: new Date().toISOString() };
      
      if (p.isDefaultForLane) {
        newProfiles.forEach((profile, i) => {
          if (profile.targetLane === p.targetLane && i !== idx) {
             newProfiles[i] = { ...profile, isDefaultForLane: false };
          }
        });
      }
      
      newProfiles[idx] = p;
      const next = { ...prev, resumeProfiles: newProfiles };
      updatePreferences(next);
      return next;
    });
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  return (
    <AppPage width="full">
      <PageHeader
        title="Settings"
        subtitle="Used to filter and score jobs"
        icon={<Settings2 size={20} color="var(--mantine-color-ink-9)" />}
        rightSection={
          <Group gap="xs">
            {saveStatus === 'saving' && (
              <Badge color="sage" variant="outline" size="sm">
                Saving...
              </Badge>
            )}
            {saveStatus === 'saved' && (
              <Badge color="lime" variant="light" size="sm" c="ink.9">
                Saved
              </Badge>
            )}
          </Group>
        }
      />

	      <Box component="main" px={{ base: mobileContentInset, xl: 'lg' }} py={{ base: 'md', xl: 'lg' }} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
	        <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md" verticalSpacing="md">
	          <Paper p={{ base: mobileSurfacePadding, xl: 'md' }}>
	             <Group mb="md" gap="sm">
	               <MapPin size={20} color="var(--mantine-color-ink-8)" />
               <Title order={2} size="1.05rem" c="ink.9" style={{ letterSpacing: '-0.02em' }}>Commute & Hours</Title>
             </Group>
             <Box style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
               <TextInput 
                 label="Home Address / Intersection"
                 placeholder="e.g. Queen & Spadina"
                 value={localPrefs.commuteOrigin}
                 onChange={e => updateLocal('commuteOrigin', e.target.value)}
                 size="md"
               />
               <Group grow>
                 <NumberInput 
                   label="Max Transit (mins)"
                   value={localPrefs.maxTransitMinutes}
                   onChange={val => updateLocal('maxTransitMinutes', typeof val === 'number' ? val : 0)}
                   size="md"
                 />
                 <NumberInput 
                   label="Min Hours/Week"
                   value={localPrefs.minWeeklyHours}
                   onChange={val => updateLocal('minWeeklyHours', typeof val === 'number' ? val : 0)}
                   size="md"
                 />
               </Group>
             </Box>
          </Paper>

	          <Paper p={{ base: mobileSurfacePadding, xl: 'md' }}>
	             <Group mb="md" gap="sm">
	               <Clock size={20} color="var(--mantine-color-ink-8)" />
               <Title order={2} size="1.05rem" c="ink.9" style={{ letterSpacing: '-0.02em' }}>Availability</Title>
	             </Group>
	             <Group mt="xs" gap="md">
               {Object.entries({
                 weekdays: 'Weekdays',
                 weekends: 'Weekends',
                 evenings: 'Evenings',
                 overnights: 'Overnights',
                 rotatingShifts: 'Rotating Shifts'
               }).map(([key, label]) => (
                 <Switch 
                   key={key}
                   label={label}
                   checked={(localPrefs.availability as any)[key]}
                   onChange={e => updateNested('availability', key, e.currentTarget.checked)}
                   size="md"
                   color="lime"
                 />
               ))}
             </Group>
          </Paper>

	          <Paper p={{ base: mobileSurfacePadding, xl: 'md' }}>
	             <Group mb="md" gap="sm">
	               <Award size={20} color="var(--mantine-color-ink-8)" />
               <Title order={2} size="1.05rem" c="ink.9" style={{ letterSpacing: '-0.02em' }}>Certifications</Title>
             </Group>
             <Box style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
               <Switch 
                 label="Food Safety Certified (e.g. FoodHandler)"
                 checked={localPrefs.certifications.foodSafety}
                 onChange={e => updateNested('certifications', 'foodSafety', e.currentTarget.checked)}
                 size="md"
                 color="lime"
               />
               <TextInput 
                 label="Warehouse Certifications"
                 placeholder="e.g. Forklift, Fall Arrest, WHMIS"
                 value={localPrefs.certifications.warehouseCerts}
                 onChange={e => updateNested('certifications', 'warehouseCerts', e.target.value)}
                 size="md"
               />
             </Box>
          </Paper>

	          <Paper p={{ base: mobileSurfacePadding, xl: 'md' }}>
	             <Group mb="md" gap="sm">
	               <ShieldCheck size={20} color="var(--mantine-color-ink-8)" />
               <Title order={2} size="1.05rem" c="ink.9" style={{ letterSpacing: '-0.02em' }}>Work Eligibility</Title>
             </Group>
             <Box style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
               <Select
                 label="Current work authorization"
                 size="md"
                 value={localPrefs.workAuthorization}
                 onChange={(value) => updateLocal('workAuthorization', value ?? localPrefs.workAuthorization)}
                 allowDeselect={false}
                 data={[
                   { value: 'citizen_or_pr', label: 'Citizen or permanent resident' },
                   { value: 'open_work_permit', label: 'Open work permit' },
                   { value: 'employer_specific_permit', label: 'Employer-specific permit' },
                   { value: 'needs_sponsorship', label: 'Needs employer sponsorship' },
                 ]}
               />
               <Text size="sm" c="ink.6">
                 Used to flag jobs that require unrestricted work authorization or exclude sponsorship.
               </Text>
             </Box>
          </Paper>

	          <Paper p={{ base: mobileSurfacePadding, xl: 'md' }}>
	             <Group mb="md" gap="sm">
	               <Settings2 size={20} color="var(--mantine-color-ink-8)" />
               <Title order={2} size="1.05rem" c="ink.9" style={{ letterSpacing: '-0.02em' }}>Job Types</Title>
	             </Group>
	             <Group gap="md">
               <Switch 
                 label="Kitchen"
                 checked={localPrefs.enabledLanes.kitchen}
                 onChange={e => updateNested('enabledLanes', 'kitchen', e.currentTarget.checked)}
                 size="md"
                 color="lime"
               />
               <Switch 
                 label="Warehouse"
                 checked={localPrefs.enabledLanes.warehouse}
                 onChange={e => updateNested('enabledLanes', 'warehouse', e.currentTarget.checked)}
                 size="md"
                 color="lime"
               />
             </Group>
          </Paper>
        </SimpleGrid>

	        <Paper p={{ base: mobileSurfacePadding, xl: 'md' }}>
	             <Group mb="xs" gap="sm">
	               <FileText size={20} color="var(--mantine-color-ink-8)" />
               <Title order={2} size="1.05rem" c="ink.9" style={{ letterSpacing: '-0.02em' }}>Resume Library</Title>
	             </Group>
	             <Text size="sm" c="ink.6" mb="lg">Manage specific CVs and notes for different job types.</Text>
	             
	             <Accordion variant="separated" radius="lg">
               {localPrefs.resumeProfiles?.map(profile => (
                 <Accordion.Item key={profile.id} value={profile.id}>
                   <Accordion.Control>
                      <Group justify="space-between" align="center" wrap="nowrap">
                        <Box>
                          <Group gap="sm" mb={4}>
	                            <Text size="sm" fw={700} c="ink.9" style={{ letterSpacing: '-0.01em' }}>{profile.title}</Text>
                            {profile.isDefaultForLane && (
                              <Badge color="sage.2" c="ink.8" variant="filled" size="sm" style={{ border: '1px dashed var(--mantine-color-sage-4)' }}>Default {profile.targetLane}</Badge>
                            )}
                          </Group>
	                          <Text size="xs" c="ink.5">Updated: {new Date(profile.lastUpdated).toLocaleDateString()}</Text>
                        </Box>
                      </Group>
                   </Accordion.Control>
                   <Accordion.Panel>
                     <ResumeProfileEditor
                       profile={profile}
                       onSave={handleSaveProfile}
                     />
                   </Accordion.Panel>
                 </Accordion.Item>
               ))}
             </Accordion>
        </Paper>
      </Box>
    </AppPage>
  );
}
