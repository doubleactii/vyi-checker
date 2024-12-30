import { Icon, VYI } from './vendor/vyi.mjs';

const sourceInput = document.getElementById('source') as HTMLInputElement;
const destinationInput = document.getElementById('destination') as HTMLInputElement;
const reportLog = document.getElementById('report-log') as HTMLDivElement;

let sourceVyi: VYI;
let destinationVyi: VYI;

sourceInput.addEventListener('change', (pEvent) => {
    const file = pEvent.target.files[0];
    const reader = new FileReader();

    reader.onload = async (pEvent) => {
        const data = pEvent.target.result;
        sourceVyi = new VYI();
        await sourceVyi.parse(data);

        if (destinationVyi) {
            isEquivalent();
        }
    };

    reader.readAsArrayBuffer(file);
});

destinationInput.addEventListener('change', (pEvent) => {
    const file = pEvent.target.files[0];
    const reader = new FileReader();

    reader.onload = async (pEvent) => {
        const data = pEvent.target.result;
        destinationVyi = new VYI();
        await destinationVyi.parse(data);

        if (sourceVyi) {
            isEquivalent();
        }
    };

    reader.readAsArrayBuffer(file);
});

/**
 * Checks if two arrays of names have the same elements (ignores order).
 */
function haveSameNames(pSourceNames: string[], pDestinationNames: string[]): string[] {
    console.log(pSourceNames, pDestinationNames);
    const missingNames = pDestinationNames.filter(name => !pSourceNames.includes(name));
    return missingNames;
}

/**
 * Checks if two icon arrays have the same state names.
 */
function hasSameStates(pSourceArray: Icon[], pDestinationArray: Icon[]): Icon[] {
    const sourceStates = pSourceArray.flatMap(icon => icon.getStates());
    const destinationStates = pDestinationArray.flatMap(icon => icon.getStates());

    const mismatchedStates = destinationStates.filter(state => 
        !sourceStates.find(srcState => srcState.getName() === state.getName())
    );

    return mismatchedStates;
}

/**
 * Compares frame counts for matching icons between two arrays.
 */
function hasEquivalentFrameCounts(pSourceIcons: Icon[], pDestinationIcons: Icon[]): Icon[] {
    const mismatchedIcons = pDestinationIcons.filter(icon => {
        const sourceIcon = pSourceIcons.find(srcIcon => srcIcon.getName() === icon.getName());
        return !sourceIcon || sourceIcon.getFrameCount() !== icon.getFrameCount();
    });

    return mismatchedIcons;
}

/**
 * Compares frame counts for matching states of icons between two arrays.
 */
function hasEquivalentStateFrameCounts(pSourceIcons: Icon[], pDestinationIcons: Icon[]): Icon[] {
    const sourceStates = pSourceIcons.flatMap(icon => icon.getStates());
    const destinationStates = pDestinationIcons.flatMap(icon => icon.getStates());

    const mismatchedStates = destinationStates.filter(state => {
        const sourceState = sourceStates.find(srcState => srcState.getName() === state.getName());
        return !sourceState || sourceState.getFrameCount() !== state.getFrameCount();
    });
    
    return mismatchedStates;
}

function isEquivalent() {
    const sourceIcons = sourceVyi.getIcons();
    const destinationIcons = destinationVyi.getIcons();
    const sourceIconNames = sourceVyi.getIconNames();
    const destinationIconNames = destinationVyi.getIconNames();

    // Perform checks
    const missingIconNames = haveSameNames(sourceIconNames, destinationIconNames);
    const iconsWithInvalidFrameCount = hasEquivalentFrameCounts(sourceIcons, destinationIcons);
    const missingIconStates = hasSameStates(sourceIcons, destinationIcons);
    const stateWithInvalidFrameCount = hasEquivalentStateFrameCounts(sourceIcons, destinationIcons);

    // Build a report
    let report = '';

    // Icon Name Mismatches
    if (missingIconNames.length) {
        report += 'Icon Mismatches:\n';
        report += missingIconNames
            .map(missingName => `- Missing icon in source: ${missingName}`)
            .join('\n');
        report += '\n\n';
    }

    // Icon Frame Count Mismatches
    const invalidIconsWithoutMissing = iconsWithInvalidFrameCount.filter(icon => !missingIconNames.includes(icon.getName()));
    if (invalidIconsWithoutMissing.length) {
        report += 'Icon Frame Count Mismatches:\n';
        report += invalidIconsWithoutMissing
            .map(icon => `- Icon '${icon.getName()}' has mismatched frame counts.`)
            .join('\n');
        report += '\n\n';
    }

    // State Mismatches
    if (missingIconStates.length) {
        report += 'State Name Mismatches:\n';
        report += missingIconStates
            .map(state => `- State '${state.getParent()?.getName()}.${state.getName()}' is missing in source.`)
            .join('\n');
        report += '\n\n';
    }

    // State Frame Count Mismatches
    if (!stateWithInvalidFrameCount.length && missingIconStates.length) {
        report += 'State Frame Count Mismatches:\n';
        report += stateWithInvalidFrameCount
            .map(state => `- State '${state.getParent()?.getName()}.${state.getName()}' has mismatched frame counts.`)
            .join('\n');
        report += '\n\n';
    }

    if (!report.trim()) {
        report = 'The source and destination VYI files are equivalent!';
    }

    reportLog.textContent = report.trim();
}