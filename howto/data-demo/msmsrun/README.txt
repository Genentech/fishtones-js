Instead of relying on a backend server, json files are directly stored.
To avoid conflict with file names containing '?' and '&' characters, they have been replaced by '_QM_' and '_AND_'.

The howto-utils.js call a jQuery ajax interceptor to tweak the urls on the fly