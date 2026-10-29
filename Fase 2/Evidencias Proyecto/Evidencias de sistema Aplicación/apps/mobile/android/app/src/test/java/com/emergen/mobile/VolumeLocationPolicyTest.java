package com.emergen.mobile;

import org.junit.Test;
import static org.junit.Assert.*;

public class VolumeLocationPolicyTest {
    @Test public void acceptsRecentFixIncludingSixtySecondBoundary() {
        assertTrue(VolumeLocationPolicy.recent(80_000_000_000L, 20_000_000_000L));
        assertTrue(VolumeLocationPolicy.recent(80_000_000_000L, 79_000_000_000L));
    }
    @Test public void rejectsStaleMissingAndFutureFixes() {
        assertFalse(VolumeLocationPolicy.recent(80_000_000_001L, 20_000_000_000L));
        assertFalse(VolumeLocationPolicy.recent(80_000_000_000L, 0));
        assertFalse(VolumeLocationPolicy.recent(20_000_000_000L, 80_000_000_000L));
    }
    @Test public void acceptsRealCoordinateRangesIncludingZero() {
        assertTrue(VolumeLocationPolicy.coordinates(-33.4378, -70.6504));
        assertTrue(VolumeLocationPolicy.coordinates(0, 0));
        assertTrue(VolumeLocationPolicy.coordinates(90, -180));
    }
    @Test public void rejectsInvalidOrNonFiniteCoordinates() {
        assertFalse(VolumeLocationPolicy.coordinates(91, 0));
        assertFalse(VolumeLocationPolicy.coordinates(0, -181));
        assertFalse(VolumeLocationPolicy.coordinates(Double.NaN, 0));
        assertFalse(VolumeLocationPolicy.coordinates(0, Double.POSITIVE_INFINITY));
    }
}
