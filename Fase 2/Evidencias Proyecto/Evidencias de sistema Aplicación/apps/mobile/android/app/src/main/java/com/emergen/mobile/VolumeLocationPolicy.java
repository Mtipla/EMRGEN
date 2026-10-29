package com.emergen.mobile;

/** Nunca presenta una ubicación antigua o con reloj inválido como actual. */
final class VolumeLocationPolicy {
    static final long MAX_AGE_NANOS = 60_000_000_000L;
    static boolean recent(long nowNanos, long fixNanos) {
        return fixNanos > 0 && nowNanos >= fixNanos && nowNanos - fixNanos <= MAX_AGE_NANOS;
    }
    static boolean coordinates(double latitude, double longitude) {
        return Double.isFinite(latitude) && Double.isFinite(longitude)
            && Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180;
    }
}
