
function calc_spectral_centroid(input_array) {
	// input array is magnitude in dB  from 0 to fs/2

	var spectral_centroid =0 ;
	var amp_sum = 0.0;

	for (var i = 0; i < input_array.length; i++) {
		amp = Math.pow(10.0, input_array[i]/20.0);
		amp_sum = amp_sum + amp;

		var freq = i/input_array.length*22050.0;
		spectral_centroid = spectral_centroid + freq*amp
	}
	spectral_centroid = spectral_centroid/(amp_sum+0.0001);

	return spectral_centroid;
}

