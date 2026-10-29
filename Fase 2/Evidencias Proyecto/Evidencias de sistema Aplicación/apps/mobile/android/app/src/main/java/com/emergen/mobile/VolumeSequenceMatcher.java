package com.emergen.mobile;

import java.util.ArrayDeque;
import java.util.Arrays;

/** Motor sin Android ni red: una pulsación física por ACTION_DOWN sin repetición. */
public final class VolumeSequenceMatcher {
    public static final int UP = 24;
    public static final int DOWN = 25;
    public static final long MAX_GAP_MS = 2000;
    private final int[] sequence;
    private final ArrayDeque<Integer> recent = new ArrayDeque<>();
    private long lastAt = -1;

    public VolumeSequenceMatcher(int[] sequence) {
        if (!valid(sequence)) throw new IllegalArgumentException("Usa entre 3 y 12 pulsaciones, incluyendo volumen + y −.");
        this.sequence = sequence.clone();
    }

    public static boolean valid(int[] keys) {
        if (keys == null || keys.length < 3 || keys.length > 12) return false;
        boolean up = false, down = false;
        for (int key : keys) {
            if (key == UP) up = true;
            else if (key == DOWN) down = true;
            else return false;
        }
        return up && down;
    }

    public boolean accept(int key, long now) {
        if (key != UP && key != DOWN) return false;
        if (lastAt >= 0 && (now < lastAt || now - lastAt > MAX_GAP_MS)) recent.clear();
        lastAt = now;
        recent.addLast(key);
        while (recent.size() > sequence.length) recent.removeFirst();
        if (recent.size() == sequence.length && Arrays.equals(sequence, recent.stream().mapToInt(Integer::intValue).toArray())) {
            reset();
            return true;
        }
        return false;
    }

    public void reset() { recent.clear(); lastAt = -1; }
}
