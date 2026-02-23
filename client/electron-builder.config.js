module.exports = {
    appId: 'com.equipe110.pokeworld',
    productName: 'PokeWorld',
    directories: {
        output: 'dist/electron',
    },
    files: [
        'dist/client/**/*',
        'app.js',
        'package.json',
    ],
    win: {
        target: [
            {
                target: 'portable',
                arch: ['x64'],
            },
        ],
        icon: 'src/app.png',
    },
    portable: {
        artifactName: 'PokeWorld.exe',
    },
};