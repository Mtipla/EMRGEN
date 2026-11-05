package com.emergen.mobile;

import org.junit.Test;
import static org.junit.Assert.*;

public class VolumeSequenceMatcherTest {
    private static final int U = VolumeSequenceMatcher.UP, D = VolumeSequenceMatcher.DOWN;
    @Test public void onlyCompletesAtLastPress() {
        VolumeSequenceMatcher matcher = new VolumeSequenceMatcher(new int[]{U,U,D,D,U});
        assertFalse(matcher.accept(U, 0)); assertFalse(matcher.accept(U, 100));
        assertFalse(matcher.accept(D, 200)); assertFalse(matcher.accept(D, 300));
        assertTrue(matcher.accept(U, 400)); assertFalse(matcher.accept(U, 500));
    }
    @Test public void ignoresOtherKeysAndHandlesOverlappingPrefix() {
        VolumeSequenceMatcher matcher = new VolumeSequenceMatcher(new int[]{U,U,D});
        assertFalse(matcher.accept(U, 0)); assertFalse(matcher.accept(4, 100));
        assertFalse(matcher.accept(U, 200)); assertFalse(matcher.accept(U, 300));
        assertTrue(matcher.accept(D, 400));
    }
    @Test public void longPauseResetsCombination() {
        VolumeSequenceMatcher matcher = new VolumeSequenceMatcher(new int[]{U,D,U});
        assertFalse(matcher.accept(U, 0)); assertFalse(matcher.accept(D, 2100));
        assertFalse(matcher.accept(U, 2200)); assertFalse(matcher.accept(D, 2300));
        assertTrue(matcher.accept(U, 2400));
    }
    @Test public void resetDoesNotLeavePartialSequence() {
        VolumeSequenceMatcher matcher = new VolumeSequenceMatcher(new int[]{U,D,U});
        matcher.accept(U, 0); matcher.accept(D, 100); matcher.reset();
        assertFalse(matcher.accept(U, 200));
    }
    @Test public void validatesOnlyVolumeAndBoundedMixedSequences() {
        assertFalse(VolumeSequenceMatcher.valid(new int[]{U,D}));
        assertFalse(VolumeSequenceMatcher.valid(new int[]{U,U,U}));
        assertFalse(VolumeSequenceMatcher.valid(new int[]{U,D,4}));
        assertTrue(VolumeSequenceMatcher.valid(new int[]{U,D,U}));
    }
}
