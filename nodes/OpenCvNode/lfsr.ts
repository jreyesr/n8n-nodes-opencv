// This function implements a Linear Feedback Shift Register (LFSR), which is a simple way to generate a periodic but seemingly random series of numbers
// See https://en.wikipedia.org/wiki/Linear-feedback_shift_register#Example_in_Python for a Python implementation
// Here we use a maximal-length 31-bit LFSR, which cycles over 2^31-1 values before repeating, with the tap values taken from https://users.ece.cmu.edu/~koopman/lfsr/ (first entry in the 31 bit file)

// LFSRs work like this:
// 1. Prepare an N-bit counter (anything except all zeroes), the "seed"
// 2. Define the "taps", i.e. which bit positions will be used in the next step (e.g. "bits 1, 3 and 7")
// 3. Take the bits on all the tap positions, XOR them together, and then push the resulting bit as the MSB of the counter, discarding the LSB
// 4. Repeat 3. while required. If the taps have been chosen correctly (there's tables for that), the counter will run over all its 2^N possible values, MINUS zero, before going back to the seed value and repeating itself

export function* lfsr(size = 31, taps: string = "0x40000004", initialValue = 1) {
	let counter = initialValue;
	const coeffs = parseInt(taps, 16).toString(2).split("").map(x => parseInt(x, 10))
	while (true) {
		let newBit = 1;
		for (let i = 0; i < size; i++) {
			if (coeffs[i]) { // coeffs runs in reverse, coeffs[0] is MSB
				newBit ^= (counter >> (size - i))
			}
		}
		newBit &= 1; // leave only LSB
		counter = (counter >> 1) | (newBit << (size - 1))
		yield counter
	}
}
