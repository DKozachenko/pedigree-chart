import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { IDiagramConfig, IRelative, selectDiagramConfig, selectRelatives, useCustomSelector } from '../../../store';
import { RelativeInfoModal } from './RelativeInfoModal';
import { GENOGRAM_CLASS } from '../models/constants';
import { useDiagram, useRelatives } from '../hooks';
import { IRelativeNode } from '../models/interfaces';

export function Diagram() {
  const diagramConfigState: IDiagramConfig = useCustomSelector(selectDiagramConfig);
  const { currentRelativeKey, centeredRelativeKey } = useCustomSelector(selectRelatives);
  const [isInfoModalOpen, setIsInfoModalOpen]: [boolean, Dispatch<SetStateAction<boolean>>] = useState<boolean>(false);
  const [selectedRelative, setSelectedRelative]: [IRelative | null, Dispatch<SetStateAction<IRelative | null>>] = useState<IRelative | null>(null);
  
  const { findRelativeByKey, getRelativesWithRelationships } = useRelatives();
  const { initLayout, setModel, focusOnNode, hasDiagramInit } = useDiagram(GENOGRAM_CLASS, diagramConfigState);

  const showRelativeInfo: (key: number) => void = useCallback((key: number) => {
    const relative: IRelative = findRelativeByKey(key);
    setSelectedRelative(relative);
    setIsInfoModalOpen(true);
  }, []);

  useEffect(() => {
    initLayout(!!currentRelativeKey, showRelativeInfo);
  }, []);

  useEffect(() => {
    if (!hasDiagramInit()) {
      return;
    }
    const nodes: IRelativeNode[] = getRelativesWithRelationships(currentRelativeKey);
    setModel(nodes);
  }, [currentRelativeKey]);

  useEffect(() => {
    if (!hasDiagramInit()) {
      return;
    }

    if (centeredRelativeKey) {
      focusOnNode(centeredRelativeKey);
    }
  }, [centeredRelativeKey]);

  const closeInfoModal: () => void = useCallback(() => {
    setIsInfoModalOpen(false);
  }, []);

  return (
    <>
      <Box 
        component="div" 
        id={GENOGRAM_CLASS}
        sx={{
          bgcolor: "#fff0",
          width: "100%", 
          height: "100%"
        }}>  
      </Box>

      {isInfoModalOpen && <RelativeInfoModal relative={selectedRelative as IRelative} isOpen={isInfoModalOpen} onClose={closeInfoModal}></RelativeInfoModal>}
    </>
  );
}
